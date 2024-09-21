
let currentPage = 0;
let hiddenThreshold = 5; // A cada 10 páginas, oculta as próximas
let incrementThreshold = 3; // A cada 3 incrementações, oculta as páginas anteriores
let lastPage = -1; // Variável para rastrear a última página ativa e otimizar atualizações

const pages = document.querySelectorAll('.page');
const pageCounter = document.getElementById('pageCounter');
const totalPages = pages.length;
const progressBarInner = document.getElementById('progressBarInner');
const pageContents = document.querySelectorAll('.page-content');
const MIN_SWIPE_DISTANCE = 90;


// Verifica os valores salvos no localStorage
let desativarAnimacoes = localStorage.getItem('desativarAnimacoes') === 'true';
let pagina_virada = localStorage.getItem('pagina_virada') === 'true';

// Agora, a lógica é que number_desativar será true apenas se nem desativarAnimacoes nem pagina_virada estiverem ativados
let number_desativar = !desativarAnimacoes && !pagina_virada;  // number_desativar é o padrão se ambos forem false





// Seleciona todos os inputs de tipo checkbox com a classe 'animation_toggle_control'
const toggles = document.querySelectorAll('.animation_toggle_control');

// Atualiza os estados dos toggles com base nas variáveis salvas
document.getElementById('toggle1').checked = number_desativar;
document.getElementById('toggle2').checked = desativarAnimacoes;
document.getElementById('toggle3').checked = pagina_virada;

// Função que garante que o número de desativar seja o padrão quando nada mais estiver ativado
function checkDefaultToggle() {
    // Se não há nenhuma opção ativada, o padrão é number_desativar
    if (!desativarAnimacoes && !pagina_virada) {
        number_desativar = true;
        localStorage.setItem('number_desativar', 'true');
        document.getElementById('toggle1').checked = true;
    } else {
        number_desativar = false; // Se outra opção estiver ativa, number_desativar é falso
        localStorage.setItem('number_desativar', 'false');
    }
}

// Chama a função checkDefaultToggle na primeira execução
checkDefaultToggle();


// Função que atualiza a interface com base no estado das variáveis
function updatePages() {
    if (desativarAnimacoes === true) {
        updatePagesDesactivate();
    } else if (number_desativar === true) {
        pages.forEach((page, index) => {
            if (index === currentPage) {
                page.style.display = "flex";
                page.style.transform = "translateX(0) scale(1)";
                page.style.opacity = "1";
                page.style.transition = "transform 1s, opacity 0.6s";
            } else if (index < currentPage) {
                page.style.display = "flex";
                page.style.transform = "translateX(-100%) scale(0.9)";
                page.style.opacity = "0";
            } else {
                page.style.display = "hide"; // Corrigi aqui de "hide" para "flex"
                page.style.transform = "translateX(100%) scale(0.9)";
                page.style.opacity = "0";
            }
        });

        updatePageCounter();
        updateProgressBar();
        localStorage.setItem('currentPage', currentPage.toString());
    } else if (pagina_virada === true) {
        pages.forEach((page, index) => {
            if (index === currentPage) {
                requestAnimationFrame(() => {
                    page.style.display = "flex";
                    page.style.transform = "rotateY(0deg)";
                })

            } else if (index < currentPage) {
                requestAnimationFrame(() => {
                    page.style.display = "flex";
                    page.style.transform = "rotateY(-180deg)";
                })
            } else {
                requestAnimationFrame(() => {
                    page.style.display = "hide";
                })
            }
        });
        updatePageCounter();
        updateProgressBar();
        localStorage.setItem('currentPage', currentPage.toString());
    }
}

toggles.forEach(toggle => {
    toggle.addEventListener('change', () => {
        // Desativa todas as variáveis e desmarca todos os toggles
        toggles.forEach(tgl => {
            if (tgl !== toggle) tgl.checked = false; // Desmarca outros switches
        });

        number_desativar = false;
        desativarAnimacoes = false;
        pagina_virada = false;

        // Define a variável correspondente ao toggle ativado como 'true'
        if (toggle.checked) {
            switch (toggle.id) {
                case 'toggle1':
                    number_desativar = true;
                    localStorage.setItem('number_desativar', 'true');
                    break;
                case 'toggle2':
                    desativarAnimacoes = true;
                    pagina_virada = false; // Garante que pagina_virada seja desativado
                    localStorage.setItem('desativarAnimacoes', 'true');
                    localStorage.setItem('pagina_virada', 'false'); // Atualiza o localStorage para false

                    // Pergunta ao usuário se deseja recarregar a página
                    const confirmReloadAnim = window.confirm('Para desativar as animações, você precisa atualizar a página. Deseja recarregar agora?');
                    if (confirmReloadAnim) {
                        location.reload(); // Recarrega a página para aplicar as mudanças
                    } else {
                        // Se o usuário cancelar, desmarque o toggle e reverta as mudanças
                        toggle.checked = false;
                        localStorage.setItem('desativarAnimacoes', 'false');
                    }
                    return; // Evita a execução de updatePages após o recarregamento
                case 'toggle3':
                    pagina_virada = true;
                    desativarAnimacoes = false; // Garante que desativarAnimacoes seja desativado
                    localStorage.setItem('pagina_virada', 'true');
                    localStorage.setItem('desativarAnimacoes', 'false'); // Atualiza o localStorage para false

                    // Pergunta ao usuário se deseja recarregar a página
                    const confirmReloadPageFlip = window.confirm('As animações de virada de página podem, dependendo da performance do seu aparelho, criar inconsistências no layout. Saiba que, ao ativar essas animações, pode haver problemas de layout.');
                    if (confirmReloadPageFlip) {
                        location.reload(); // Recarrega a página para aplicar as mudanças
                    } else {
                        // Se o usuário cancelar, desmarque o toggle e reverta as mudanças
                        toggle.checked = false;
                        localStorage.setItem('pagina_virada', 'false');
                    }
                    return; // Evita a execução de updatePages após o recarregamento
            }
        } else {
            // Limpa os estados salvos quando o toggle é desativado
            localStorage.removeItem('desativarAnimacoes');
            localStorage.removeItem('pagina_virada');
        }

        // Chama a função updatePages para atualizar a interface conforme o estado atual
        updatePages();

        console.log({
            number_desativar,
            desativarAnimacoes,
            pagina_virada
        });
    });
});



function nextPage() {
    if (desativarAnimacoes === true) {
        nextPageDesactivate();
    } else {
        if (currentPage < pages.length - 1) {
            pages[currentPage].style.zIndex = pages.length - currentPage;
            pages[currentPage].classList.add('turn');
            setTimeout(() => {
                pages[currentPage].classList.remove('turn');
            }, 1000);
            lastPage = currentPage;
            currentPage++;
            console.log(currentPage);
            updatePages();
            updateProgressBar();

            refreshPageCounter();
            refreshProgressBar();

            // Atualizar as páginas visíveis de forma otimizada
            updateVisiblePages();
        } else {
            console.log("Não é possível avançar mais, você está na última página.");
        }
    }
}


function prevPage() {
    if (desativarAnimacoes === true) {
        PrevPageDesactivate();
    } else {
        if (currentPage > 0) {
            currentPage--;
            pages[currentPage].style.zIndex = pages.length - currentPage;
            pages[currentPage].classList.remove('turn');
            setTimeout(() => {
                pages[currentPage].classList.add('turn');
            }, 100);
            console.log(currentPage);
            updatePages();
            updateProgressBar();
            refreshProgressBar();

            // Atualizar as páginas visíveis de forma otimizada
            updateVisiblePages();
        }
    }
}

function updateVisiblePages() {
    // Atualizar apenas se a página realmente mudou
    if (currentPage !== lastPage) {
        pages.forEach((page, index) => {
            const isBookmarked = bookmarks.includes(index); // Verifica se a página está marcada
            let rangeStart = Math.max(currentPage - incrementThreshold, 0); // Páginas antes do capítulo
            let rangeEnd = Math.min(currentPage + hiddenThreshold, pages.length - 1); // Páginas depois do capítulo

            if ((index < currentPage - incrementThreshold || index > currentPage + hiddenThreshold) && !isBookmarked) {
                // Se a página estiver fora do intervalo e não estiver marcada, ela pode ser ocultada
                page.style.visibility = "hidden";
                page.style.opacity = "0";
            } else if (index >= rangeStart && index <= rangeEnd) {
                // Garante que páginas dentro do intervalo estejam visíveis
                page.style.visibility = "visible";
                page.style.opacity = "1";
            }
        });
        lastPage = currentPage; // Atualiza a última página processada
    }
}





function hideNextPages() {
    pages.forEach((page, index) => {
        if (index > currentPage + hiddenThreshold) {
            page.style.visibility = "hidden"; // Esconde, mas mantém no layout
            page.style.opacity = "0"; // Suaviza a transição de visibilidade
        }
    });
}


function showNextPages() {
    pages.forEach((page, index) => {
        if (index <= currentPage + hiddenThreshold) {
            page.style.visibility = "visible"; // Torna a página visível novamente
            page.style.opacity = "1"; // Suaviza a transição de visibilidade
        }
    });
}


function hidePreviousPages() {
    pages.forEach((page, index) => {
        if (index < currentPage - incrementThreshold) {
            page.style.visibility = "hidden"; // Esconde, mas mantém no layout
            page.style.opacity = "0"; // Suaviza a transição de visibilidade
        }
    });
}


function showPreviousPages() {
    pages.forEach((page, index) => {
        if (index >= currentPage - incrementThreshold) {
            page.style.visibility = "visible"; // Torna a página visível novamente
            page.style.opacity = "1"; // Suaviza a transição de visibilidade
        }
    });
}




function updatePagesDesactivate() {
    pages.forEach((page, index) => {
        if (index === currentPage) {
            page.style.display = "flex";
            page.style.transform = "rotateY(0deg)";
        } else if (index < currentPage) {
            page.style.display = "flex";
        } else {
            page.style.display = "hide";
        }
    });
    updatePageCounter();
    updateVisiblePages();
    updateProgressBar();
    localStorage.setItem('currentPage', currentPage.toString());
}

function nextPageDesactivate() {
    if (currentPage < pages.length - 1) {
        currentPage++;
        updatePages();
        updateProgressBar()
        refreshPageCounter();
        refreshProgressBar();
        updateVisiblePages();
        refreshProgressBar()
    }
}

function PrevPageDesactivate() {
    if (currentPage > 0) {
        currentPage--;
        updatePages();
        updateProgressBar()
        updateVisiblePages();
        refreshProgressBar()
    }
}



function adjustContainerHeight(option = '1/4', button = null) {
    // Verifica se o botão está definido
    if (button && button.classList) {
        // Remove a classe 'active' de todos os switches
        const switches = document.querySelectorAll('.toggle-switch');
        switches.forEach(switchElement => switchElement.classList.remove('active'));

        // Adiciona a classe 'active' ao switch clicado
        button.classList.add('active');
    }

    // Define o container e calcula a altura nova
    const container = document.querySelector('.buttons-Customize-Container');
    const viewportHeight = window.innerHeight;

    let newHeight;

    switch (option) {
        case '1/3':
            newHeight = viewportHeight / 3;
            break;
        case '1/3+5':
            newHeight = (viewportHeight / 3) + (0.05 * viewportHeight);
            break;
        case '1/4':
            newHeight = viewportHeight / 4;
            break;
        case '1/4+5':
            newHeight = (viewportHeight / 4) + (0.05 * viewportHeight);
            break;
        default:
            newHeight = (viewportHeight / 3) + (0.05 * viewportHeight);
    }

    // Aplica a altura ajustada ao container
    if (container) {
        container.style.setProperty('height', `${newHeight}px`, 'important');
        console.log(`A altura ajustada para: ${newHeight}px`);
    }
}






adjustContainerHeight()


function adjustIconSizes() {
    // Obtém a largura da tela do usuário
    const screenWidth = window.innerWidth;

    // Define os tamanhos com base na resolução
    let iconSize;
    if (screenWidth >= 1920) { // Full HD ou maior
        iconSize = 25;
    } else { // HD ou menor
        iconSize = 30;
    }

    // Aplica os tamanhos para os ícones
    const lockIcon = document.querySelector('.lock-icon');
    const bookmarkIcon = document.querySelector('.icon-book-mark');
    console.log(lockIcon);
    console.log(bookmarkIcon);


    lockIcon.style.width = iconSize + 'px';
    lockIcon.style.height = iconSize + 'px';

    bookmarkIcon.style.width = iconSize + 'px';
    bookmarkIcon.style.height = iconSize + 'px';
}

// Ajusta o tamanho dos ícones quando a página carrega
window.onload = adjustIconSizes;

// Ajusta o tamanho dos ícones quando a janela é redimensionada
window.onresize = adjustIconSizes;

adjustIconSizes()

const canvasSide = document.getElementById('confettiCanvasSide');
const ctxSide = canvasSide.getContext('2d');

canvasSide.width = window.innerWidth;
canvasSide.height = window.innerHeight;

const colorsSide = ['#BF0A2B', '#F2AE2E', '#A0020D', '#F26513', '#F26513', '#D9310B'];

function createConfettiSide() {
    return {
        x: -Math.random() * canvasSide.width,
        y: Math.random() * canvasSide.height,
        size: Math.random() * 5 + 2,
        speedX: Math.random() * 5 + 2,
        speedY: Math.random() * 2 - 1,
        color: colorsSide[Math.floor(Math.random() * colorsSide.length)],
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 0.1 - 0.05
    };
}

// Limite o número de confetes para melhorar o desempenho.
const confettiArraySide = Array.from({ length: 55 }, createConfettiSide);
let lastTime = 0;

function animateConfettiSide(timestamp) {
    // Controle de FPS (30 FPS)
    if (timestamp - lastTime < 1000 / 30) {
        requestAnimationFrame(animateConfettiSide);
        return;
    }
    lastTime = timestamp;

    ctxSide.clearRect(0, 0, canvasSide.width, canvasSide.height);

    confettiArraySide.forEach(confettiSide => {
        confettiSide.x += confettiSide.speedX;
        confettiSide.y += confettiSide.speedY;
        confettiSide.rotation += confettiSide.rotationSpeed;

        // Verificação simples para resetar o confete ao sair da tela
        if (confettiSide.x > canvasSide.width || confettiSide.y > canvasSide.height || confettiSide.y < -confettiSide.size) {
            confettiSide.x = -confettiSide.size;
            confettiSide.y = Math.random() * canvasSide.height;
            confettiSide.speedX = Math.random() * 5 + 2;
            confettiSide.speedY = Math.random() * 2 - 1;
            confettiSide.rotation = Math.random() * 360;
        }

        ctxSide.save();
        ctxSide.translate(confettiSide.x, confettiSide.y);
        ctxSide.rotate(confettiSide.rotation * Math.PI / 180);
        ctxSide.fillStyle = confettiSide.color;
        ctxSide.fillRect(-confettiSide.size / 2, -confettiSide.size / 2, confettiSide.size, confettiSide.size);
        ctxSide.restore();
    });

    requestAnimationFrame(animateConfettiSide);
}

requestAnimationFrame(animateConfettiSide);

window.addEventListener('resize', () => {
    canvasSide.width = window.innerWidth;
    canvasSide.height = window.innerHeight;
});



function checkSavedProgress() {
    const savedPage = localStorage.getItem('currentPage');
    if (savedPage !== null) {
        showModal();
    } else {
        console.log(",,,,")
    }
}

function showModal() {
    const modal = document.getElementById('myModal');
    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('myModal');
    modal.style.display = 'none';
}

function continueFromLast() {
    const savedPage = localStorage.getItem('currentPage');
    if (savedPage !== null) {
        currentPage = parseInt(savedPage);
        updatePages();
    }
    closeModal();
}





function startFromBeginning() {
    // Definir currentPage como 0
    currentPage = 0;

    // Atualizar as páginas
    updatePages();

    // Fechar o modal
    closeModal();

    // Selecionar todas as divs com a classe 'turn'
    const turnDivs = document.querySelectorAll('.turn');

    // Iterar sobre todas as divs, exceto a primeira
    turnDivs.forEach((div, index) => {
        if (index !== 0) {
            div.style.display = 'none';
        }
    });

    location.reload();

}




function updatePagesDesactivate() {
    pages.forEach((page, index) => {
        if (index === currentPage) {
            page.style.display = "flex";
            page.style.transform = "rotateY(0deg)";
        } else if (index < currentPage) {
            page.style.display = "flex";
        } else {
            page.style.display = "none";
        }
    });
    updatePageCounter();
    updateProgressBar();
    localStorage.setItem('currentPage', currentPage.toString());
}


function updatePageCounter() {
    pageCounter.textContent = `Página ${currentPage + 1} de ${totalPages}`;
}

function updateProgressBar() {
    const progress = ((currentPage + 1) / totalPages) * 100;
    progressBarInner.style.width = `${progress}%`;
    const colorClasses = ['white', 'orange', 'purple', 'green', 'pink'];
    const colorIndex = Math.floor(currentPage / 10) % colorClasses.length;
    progressBarInner.classList.remove(...colorClasses);
    progressBarInner.classList.add(colorClasses[colorIndex]);
}

function setFontSize(size) {
    pageContents.forEach(content => {
        content.style.fontSize = size;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    pageContents.forEach(content => {

        content.style.fontSize = "0.8rem"

    })
})


// Função para atualizar o tamanho da fonte com base na seleção do usuário
function updateFontSize(rangeElement) {
    const size = rangeElement.value + 'rem';
    const pageContents = document.querySelectorAll('.page-content');
    pageContents.forEach(content => {
        content.style.fontSize = size;
    });
}



function setLightMode() {
    localStorage.setItem('theme', 'light-mode');
    applyTheme('light-mode');

}

function setDarkMode() {
    localStorage.setItem('theme', 'dark-mode');
    applyTheme('dark-mode');

}

function setCustomMode() {
    localStorage.setItem('theme', 'custom-mode');
    applyTheme('custom-mode');

}

// Função para aplicar o tema baseado na escolha do usuário
function applyTheme(theme) {
    // Remove todos os temas possíveis
    document.body.classList.remove('light-mode', 'dark-mode', 'custom-mode');
    // Adiciona o tema escolhido
    document.body.classList.add(theme);

    // Altera a cor do loading-screen conforme o tema
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        // Força a atualização da cor ao clicar nos botões
        loadingScreen.classList.remove('light-mode', 'dark-mode', 'custom-mode');
        loadingScreen.classList.add(theme);
    }
}

// Função para carregar o tema salvo ao inicializar a página
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    }
}

// Chama a função para carregar o tema ao iniciar a página
loadTheme();


function goToChapter(chapterNumber) {
    currentPage = chapterNumber - 1;

    // Atualiza as páginas com base no novo capítulo, garantindo que as páginas próximas também não sejam ocultadas
    updatePages();

    // Definir intervalo de páginas ao redor do capítulo atual que não devem ser ocultadas
    let rangeStart = Math.max(currentPage - incrementThreshold, 0); // Páginas antes do capítulo
    let rangeEnd = Math.min(currentPage + hiddenThreshold, pages.length - 1); // Páginas depois do capítulo

    // Garante que todas as páginas no intervalo estejam visíveis
    for (let i = rangeStart; i <= rangeEnd; i++) {
        pages[i].style.visibility = "visible";
        pages[i].style.opacity = "1";
    }
}


function toggleAudioPlayer() {
    const modal = document.getElementById('myModal');
    if (modal.style.display === 'none' || modal.style.display === '') {
        modal.style.display = 'block';
        playAudio();
    } else {
        modal.style.display = 'none';
        stopAudio();
    }
}

function randomColor() {
    const colors = ['#f54242', '#f5e042', '#42f55f', '#4287f5', '#a742f5'];
    return colors[Math.floor(Math.random() * colors.length)];
}




document.addEventListener("DOMContentLoaded", function () {
    const buttons = document.querySelectorAll(".complete-btn");

    // Função para obter o dia da semana atual como string
    function getCurrentDay() {
        const days = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
        const currentDay = new Date().getDay();
        return days[currentDay];
    }

    buttons.forEach(button => {
        const listItem = button.parentElement;
        const taskDay = listItem.querySelector(".date").textContent;
        const itemId = listItem.getAttribute('id'); // Obtém o ID do item

        if (!itemId) {
            console.warn('O item da lista não possui um ID válido:', listItem);
            return; // Se o item não tem um ID, ignora essa tarefa
        }

        const isCompleted = localStorage.getItem(itemId);

        // Restaurar estado do item a partir do localStorage
        if (isCompleted === "true") {
            listItem.classList.add("completed");
        }

        button.addEventListener("click", function () {
            const currentDay = getCurrentDay();

            // Verifica se o dia atual corresponde ao dia da tarefa
            if (currentDay === taskDay) {
                listItem.classList.toggle("completed");

                // Salvar o estado no localStorage
                const isNowCompleted = listItem.classList.contains("completed");
                localStorage.setItem(itemId, isNowCompleted);
            } else {
                window.alert(`Você só pode marcar essa tarefa na ${taskDay}. Hoje é ${currentDay}.`);
            }
        });
    });
});


document.addEventListener('DOMContentLoaded', function () {
    var modal = document.getElementById("videoModal");
    var btn = document.getElementById("showVideo");
    var span = document.getElementsByClassName("close-video")[0];
    var iframe = document.getElementById("youtubeVideo");

    btn.onclick = function () {
        modal.style.display = "block";
        iframe.src = "https://www.youtube.com/embed/g1LNTAdIi8k?si=G2U7X9mXUyBkyKay";
    }

    span.onclick = function () {
        modal.style.display = "none";
        iframe.src = "";
    }

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
            iframe.src = "";
        }
    }
});

window.onload = checkSavedProgress;

function requestNotificationPermission() {
    if (Notification.permission !== 'granted') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.log('Notificações permitidas');
            }
        });
    }
}


document.getElementById('fullscreenBtn').addEventListener('click', function () {
    console.log("cliquei")
    const bookElement = document.querySelector('.book');
    if (bookElement.requestFullscreen) {
        bookElement.requestFullscreen();
    } else if (bookElement.mozRequestFullScreen) {
        bookElement.mozRequestFullScreen();
    } else if (bookElement.webkitRequestFullscreen) {
        bookElement.webkitRequestFullscreen();
    } else if (bookElement.msRequestFullscreen) {
        bookElement.msRequestFullscreen();
    }
});


function ChangeFullScreenModeTablet() {
    const bookElement = document.querySelector('.book');
    const getTabletFullScreen = document.querySelector("fullScreenTablet")
    if (bookElement.requestFullscreen) {
        bookElement.requestFullscreen();
    } else if (bookElement.mozRequestFullScreen) {
        bookElement.mozRequestFullScreen();
    } else if (bookElement.webkitRequestFullscreen) {
        bookElement.webkitRequestFullscreen();
    } else if (bookElement.msRequestFullscreen) {
        bookElement.msRequestFullscreen();
    }
}



const bookElement = document.querySelector('.book');
let touchstartX = 0;
let touchendX = 0;

bookElement.addEventListener('touchstart', function (event) {
    touchstartX = event.changedTouches[0].screenX;
}, false);

bookElement.addEventListener('touchend', function (event) {
    touchendX = event.changedTouches[0].screenX;
    handleGesture();
}, false);

document.addEventListener('fullscreenchange', handleFullscreenChange);
document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
document.addEventListener('mozfullscreenchange', handleFullscreenChange);
document.addEventListener('MSFullscreenChange', handleFullscreenChange);

function handleFullscreenChange() {
    const bookElement = document.querySelector('.book');
    if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
        enableTouchNavigation(bookElement);
    } else {
        disableTouchNavigation(bookElement);
    }
}

function handleGesture() {
    const swipeDistance = touchendX - touchstartX;
    if (Math.abs(swipeDistance) > MIN_SWIPE_DISTANCE) {
        if (swipeDistance < 0) {
            nextPage();
        } else {
            prevPage();
        }
    }
}


let speechSynthesisUtterance;
let readingAloud = false;

function toggleReadAloud() {
    readingAloud = !readingAloud;
    const readAloudBtn = document.getElementById('customReadAloudBtn');
    if (readingAloud) {
        readAloudBtn.textContent = 'Parar Leitura ';
        readCurrentPageAloud();
    } else {
        readAloudBtn.textContent = 'Ler';
        stopReadAloud();
    }
}

function readCurrentPageAloud() {
    const currentPageElement = pages[currentPage];
    const elementsToRead = currentPageElement.querySelectorAll('.page-content > *'); // Seleciona todos os elementos filhos diretos da página

    let currentElementIndex = 0;
    let currentTextIndex = 0;

    const speechSynthesisUtterance = new SpeechSynthesisUtterance();
    speechSynthesisUtterance.lang = 'pt-BR';

    // Função para encontrar o próximo elemento visível com texto
    function findNextElementWithText() {
        while (currentElementIndex < elementsToRead.length) {
            const element = elementsToRead[currentElementIndex];
            if (element.textContent.trim() !== '') {
                return element;
            }
            currentElementIndex++;
        }
        return null;
    }

    speechSynthesisUtterance.onboundary = event => {
        if (event.name === 'word') {
            const wordIndex = event.charIndex;

            // Remove a classe reading de todos os elementos
            elementsToRead.forEach(element => {
                element.classList.remove('reading');
            });

            // Encontra o próximo elemento visível com texto
            let nextElement = findNextElementWithText();

            // Encontra o elemento que contém a palavra atual
            while (nextElement && currentTextIndex + nextElement.textContent.length <= wordIndex) {
                currentTextIndex += nextElement.textContent.length;
                currentElementIndex++;
                nextElement = findNextElementWithText();
            }

            if (nextElement) {
                nextElement.classList.add('reading');
            }
        }
    };

    speechSynthesisUtterance.onend = () => {
        // Remove a classe reading de todos os elementos ao finalizar a leitura
        elementsToRead.forEach(element => {
            element.classList.remove('reading');
        });

        if (readingAloud) {
            if (currentPage < totalPages - 1) {
                nextPage();
                readCurrentPageAloud();
            } else {
                stopReadAloud();
            }
        }
    };

    // Constrói o texto completo a partir dos elementos
    let fullText = '';
    elementsToRead.forEach(element => {
        fullText += element.textContent + ' ';
    });

    speechSynthesisUtterance.text = fullText.trim();
    window.speechSynthesis.speak(speechSynthesisUtterance);
}

function stopReadAloud() {
    window.speechSynthesis.cancel();
}


function nextPage2() {
    if (readingAloud) {
        stopReadAloud();
    }
    if (desativarAnimacoes) {
        nextPageDesactivate();
    } else {
        if (currentPage < pages.length - 1) {
            pages[currentPage].style.zIndex = pages.length - currentPage;
            pages[currentPage].classList.add('turn');
            setTimeout(() => {
                pages[currentPage].classList.remove('turn');
            }, 1000);
            currentPage++;
            updatePages();
        }
    }
}

function prevPage2() {
    if (readingAloud) {
        stopReadAloud();
    }
    if (desativarAnimacoes) {
        PrevPageDesactivate();
    } else {
        if (currentPage > 0) {
            currentPage--;
            pages[currentPage].style.zIndex = pages.length - currentPage;
            pages[currentPage].classList.remove('turn');
            setTimeout(() => {
                pages[currentPage].classList.add('turn');
            }, 100);
            updatePages();
        }
    }
}


document.getElementById('toggle-read-mode-btn').addEventListener('click', () => {


    document.body.classList.toggle('read-mode');
    const isReadMode = document.body.classList.contains('read-mode');
    document.getElementById('toggle-read-mode-btn').textContent = isReadMode ? ' ' : '';

    // Adiciona a classe hidden a todos os botões
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.classList.toggle('hidden', isReadMode);
    });

    if (isReadMode) {
        showUniqueProgressBar();
    } else {
        hideUniqueProgressBar();
    }
});



document.getElementById('toggle-read-mode-btn').addEventListener('click', () => {
    document.body.classList.toggle('read-mode');
    const isReadMode = document.body.classList.contains('read-mode');
    document.getElementById('toggle-read-mode-btn').textContent = isReadMode ? '' : '';

    // Adiciona a classe hidden a todos os botões
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.classList.toggle('hidden', isReadMode);
    });

    if (isReadMode) {
        showUniqueProgressBar();
    } else {
        hideUniqueProgressBar();
    }
});

const uniqueProgressBarContainer = document.getElementById('unique-progress-bar-container');
const uniqueProgressBar = document.getElementById('unique-progress-bar');
const uniqueProgressBarText = document.getElementById('unique-progress-bar-text');
let uniqueIsDragging = false;

function showUniqueProgressBar() {
    uniqueProgressBarContainer.classList.remove('hidden');
}

function hideUniqueProgressBar() {
    uniqueProgressBarContainer.classList.add('hidden');
    uniqueProgressBar.style.width = '0';
}

uniqueProgressBarContainer.addEventListener('mousedown', (e) => {
    uniqueIsDragging = true;
    updateUniqueProgress(e.clientX);
});

uniqueProgressBarContainer.addEventListener('touchstart', (e) => {
    uniqueIsDragging = true;
    updateUniqueProgress(e.touches[0].clientX);
});

document.addEventListener('mousemove', (e) => {
    if (uniqueIsDragging) {
        updateUniqueProgress(e.clientX);
    }
});

document.addEventListener('touchmove', (e) => {
    if (uniqueIsDragging) {
        updateUniqueProgress(e.touches[0].clientX);
    }
});

document.addEventListener('mouseup', () => {
    if (uniqueIsDragging) {
        uniqueIsDragging = false;
        checkUniqueCompletion();
    }
});

document.addEventListener('touchend', () => {
    if (uniqueIsDragging) {
        uniqueIsDragging = false;
        checkUniqueCompletion();
    }
});

function updateUniqueProgress(clientX) {
    const rect = uniqueProgressBarContainer.getBoundingClientRect();
    const width = rect.width;
    let newWidth = clientX - rect.left;
    newWidth = Math.max(0, Math.min(newWidth, width));
    uniqueProgressBar.style.width = newWidth + 'px';
    uniqueProgressBarText.style.visibility = newWidth > 0 ? 'hidden' : 'visible'; // Ocultar texto durante o arrasto
}

function checkUniqueCompletion() {
    const rect = uniqueProgressBarContainer.getBoundingClientRect();
    const progress = uniqueProgressBar.getBoundingClientRect().width;
    if (progress >= rect.width) {
        exitUniqueReadMode();
    } else {
        uniqueProgressBar.style.width = '0';
        uniqueProgressBarText.style.visibility = 'visible'; // Mostrar texto novamente se não completado
    }
}

function exitUniqueReadMode() {
    document.body.classList.remove('read-mode');
    document.querySelectorAll('button').forEach(button => button.classList.remove('hidden'));
    hideUniqueProgressBar();
}

function enterUniqueReadMode() {
    document.body.classList.add('read-mode');
    document.querySelectorAll('button').forEach(button => button.classList.add('hidden'));
    showUniqueProgressBar();
}

// Exemplo de como entrar no modo de leitura
document.getElementById('toggle-read-mode-btn').addEventListener('click', enterUniqueReadMode);



document.addEventListener('DOMContentLoaded', function () {
    // Supondo que você tenha um identificador para a página com animação de chuva
    let pageWithRain = document.querySelector('.falling-leaves');
    if (pageWithRain) {
        // Ativar a animação de chuva
        pageWithRain.classList.add('active');
    }
});

let pressTimer;

document.querySelector('.letter-image').addEventListener('mousedown', function () {
    // Inicia o temporizador quando o mouse é pressionado
    pressTimer = setTimeout(() => {
        // Se o botão do mouse for mantido por 500ms, o evento é disparado
        this.classList.toggle('open');
    }, 600); // Altere 500 para o tempo desejado em milissegundos
});







document.addEventListener('DOMContentLoaded', () => {
    const tourPopup = document.getElementById('tourPopup');
    const startTourButton = document.getElementById('startTourButton');
    const closePopupButton = document.getElementById('closePopupButton');
    const tourIcon = document.querySelector('.Panic-Button');
    const lockIcon = document.getElementById('lock-icon');
    const body = document.body;
    const buttonsCustomizerContainer = document.querySelector('.buttons-Customizer-Container'); // Seleciona a div alvo

    // Função para alternar o estado do cadeado
    function toggleLock() {
        if (lockIcon.classList.contains('locked')) {
            lockIcon.classList.remove('locked');
            lockIcon.classList.add('unlocked');
            body.style.removeProperty('overflow-y');
            if (buttonsCustomizerContainer) {
                buttonsCustomizerContainer.style.setProperty('overflow-y', 'auto', 'important'); // Permite scroll na div
            }
            window.scrollTo({ top: 100, behavior: 'smooth' });
        } else {
            lockIcon.classList.remove('unlocked');
            lockIcon.classList.add('locked');
            body.style.setProperty('overflow-y', 'hidden', 'important');
            if (buttonsCustomizerContainer) {
                buttonsCustomizerContainer.style.setProperty('overflow-y', 'hidden', 'important'); // Bloqueia scroll na div
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    // Inicia com o cadeado fechado
    lockIcon.classList.add('locked');
    body.style.setProperty('overflow-y', 'hidden', 'important');
    if (buttonsCustomizerContainer) {
        buttonsCustomizerContainer.style.setProperty('overflow-y', 'hidden', 'important'); // Bloqueia scroll na div inicialmente
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });

    lockIcon.addEventListener('click', toggleLock);

    // Adiciona o evento de clique na div com a classe tour-icon
    if (tourIcon) {
        tourIcon.addEventListener('click', () => {
            tourPopup.style.display = 'block';
        });
    }

    startTourButton.onclick = () => {
        startTour();
        tourPopup.style.display = 'none';
    };

    closePopupButton.onclick = () => {
        tourPopup.style.display = 'none';
    };

    // Função para iniciar o tour apenas com elementos do grupo1
    function startTour() {
        toggleLock(); // Desbloqueia o cadeado

        // Seleciona apenas os elementos do grupo1
        const elementosDoGrupo1 = document.querySelectorAll('[data-tour="grupo1"]');

        // Configura o introJs para utilizar apenas os elementos do grupo1
        introJs().setOptions({
            steps: Array.from(elementosDoGrupo1).map(el => ({
                element: el,
                intro: el.getAttribute('data-intro'),
                position: el.getAttribute('data-position') || 'bottom',
            }))
        }).start(); // Inicia o tour
    }
    // Modal de vídeo customizado
    var customModal = document.getElementById("customVideoModal");
    var customCloseBtn = document.getElementsByClassName("custom-close-video")[0];
    var customIframe = document.getElementById("customYoutubeVideo");

    document.querySelectorAll('.custom-video-item').forEach(function (item) {
        item.addEventListener('click', function () {
            var customVideoUrl = this.getAttribute('data-custom-video-url');
            customModal.style.display = "block";
            customIframe.src = customVideoUrl;
        });
    });

    customCloseBtn.onclick = function () {
        customModal.style.display = "none";
        customIframe.src = "";
    };

    window.onclick = function (event) {
        if (event.target == customModal) {
            customModal.style.display = "none";
            customIframe.src = "";
        }
    };
});



const progressBarInner_track = document.getElementById('progressBarInner-track');

function refreshPageCounter() {
    pageCounter.textContent = `Página ${currentPage + 1} de ${totalPages}`;
}

function refreshProgressBar() {
    const progress = ((currentPage + 1) / totalPages) * 100;
    progressBarInner_track.style.width = `${progress}%`;
    const colorClasses = ['white', 'orange', 'purple', 'green', 'pink'];
    const colorIndex = Math.floor(currentPage / 10) % colorClasses.length;
    progressBarInner_track.classList.remove(...colorClasses);
    progressBarInner_track.classList.add(colorClasses[colorIndex]);
}



document.addEventListener('DOMContentLoaded', () => {
    const containers_mel_amarelo = document.querySelectorAll('.container_mel_amarelo'); // lista de todos os containers
    const numberOfDrops_mel_amarelo = 3; // Número de gotas
    const dropInterval_mel_amarelo = 1000; // Intervalo entre gotas em milissegundos

    containers_mel_amarelo.forEach(container_mel_amarelo => { // Iterar sobre cada container
        for (let i = 0; i < numberOfDrops_mel_amarelo; i++) {
            setTimeout(() => createDrop_mel_amarelo(container_mel_amarelo), i * dropInterval_mel_amarelo);
        }

        function createDrop_mel_amarelo(container_mel_amarelo) {
            const drop_mel_amarelo = document.createElement('div');
            drop_mel_amarelo.className = 'drop_mel_amarelo';
            drop_mel_amarelo.style.left = `${Math.random() * 100}%`; // Posiciona a gota aleatoriamente na largura da tela

            container_mel_amarelo.appendChild(drop_mel_amarelo);

            let cycleCount_mel_amarelo = 0; // Contador de ciclos

            drop_mel_amarelo.addEventListener('animationiteration', () => {
                if (cycleCount_mel_amarelo <= 2) {
                    createTrail_mel_amarelo(drop_mel_amarelo, container_mel_amarelo);
                    cycleCount_mel_amarelo++;
                    drop_mel_amarelo.style.left = `${Math.random() * 100}%`; // Reposiciona a gota aleatoriamente na largura da tela após cada iteração
                } else {
                    drop_mel_amarelo.remove(); // Remove a gota após 10 ciclos
                }
            });
        }

        function createTrail_mel_amarelo(drop_mel_amarelo, container_mel_amarelo) {
            const trailInterval_mel_amarelo = setInterval(() => {
                const trail_mel_amarelo = document.createElement('div');
                trail_mel_amarelo.className = 'trail_mel_amarelo';
                trail_mel_amarelo.style.left = drop_mel_amarelo.style.left;
                trail_mel_amarelo.style.top = `${drop_mel_amarelo.offsetTop}px`;
                container_mel_amarelo.appendChild(trail_mel_amarelo);
            }, 200); // Ajuste o intervalo conforme necessário

            // Parar a criação do rastro após a animação da gota ser concluída
            setTimeout(() => {
                clearInterval(trailInterval_mel_amarelo);
            }, 3000); // Deve coincidir com a duração da animação da gota
        }
    });
});





// Variável para armazenar as páginas marcadas
let bookmarks = [];

// Função para adicionar ou remover bookmark
function toggleBookmark() {
    // Verifica se a página atual já está marcada
    const bookmarkIndex = bookmarks.indexOf(currentPage);

    if (bookmarkIndex !== -1) {
        // Página já marcada - remove a marcação
        bookmarks.splice(bookmarkIndex, 1);
        removeBookmarkIcon(currentPage);
    } else {
        // Página não marcada - adiciona a marcação
        bookmarks.push(currentPage);
        addBookmarkIcon(currentPage);
    }

    renderBookmarks();
    saveBookmarks();
    toggleClearBookmarksButton(); // Verifica se deve mostrar ou ocultar o botão
}

// Função para adicionar o ícone de bookmark em uma página
function addBookmarkIcon(page) {
    const pageElement = pages[page];
    let bookmarkIcon = pageElement.querySelector('.page-bookmark-icon');

    if (!bookmarkIcon) {
        bookmarkIcon = document.createElement('div');
        bookmarkIcon.classList.add('page-bookmark-icon');
        bookmarkIcon.addEventListener('click', toggleBookmark);
        pageElement.appendChild(bookmarkIcon);
    }
}

// Função para remover o ícone de bookmark de uma página
function removeBookmarkIcon(page) {
    const pageElement = pages[page];
    const bookmarkIcon = pageElement.querySelector('.page-bookmark-icon');

    if (bookmarkIcon) {
        pageElement.removeChild(bookmarkIcon);
    }
}

// Função para renderizar as páginas marcadas nas seções "Marcações"
// Função para renderizar as páginas marcadas nas seções "Marcações"
// Função para renderizar as páginas marcadas nas seções "Marcações"
function renderBookmarks() {
    const numMaxLinksPerColumn = 13;
    const bookmarksContainers = [
        document.querySelector('.bookmarks-list'),
        document.querySelector('.bookmarks-list-2'),
        document.querySelector('.bookmarks-list-3'),
        document.querySelector('.bookmarks-list-4'),
        document.querySelector('.bookmarks-list-5')
    ];

    // Limpa todas as marcações existentes nos containers
    bookmarksContainers.forEach(container => {
        if (container) {
            container.innerHTML = '';
        }
    });

    bookmarks.forEach((page, index) => {
        const bookmarkLink = document.createElement('p');
        bookmarkLink.classList.add('bookmark-link');
        bookmarkLink.textContent = `${page + 1}`;
        bookmarkLink.onclick = () => goToChapter(page + 1);

        // Calcula em qual container o link deve ser adicionado
        const containerIndex = Math.floor(index / numMaxLinksPerColumn);

        // Garante que o índice do container não ultrapasse o número de colunas disponíveis
        if (containerIndex < bookmarksContainers.length) {
            bookmarksContainers[containerIndex].appendChild(bookmarkLink);
        }
    });
}


// Função para salvar as marcações no localStorage
function saveBookmarks() {
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
}

// Função para carregar as marcações e adicionar ícones de bookmark
function loadBookmarks() {
    const storedBookmarks = JSON.parse(localStorage.getItem('bookmarks'));
    if (storedBookmarks) {
        bookmarks = storedBookmarks;
        renderBookmarks();

        // Adiciona ícones de bookmark para as páginas marcadas
        bookmarks.forEach(page => {
            addBookmarkIcon(page);
        });

        toggleClearBookmarksButton(); // Verifica se deve mostrar o botão ao carregar
    }
}

// Função para mostrar ou ocultar o botão de limpar marcações
function toggleClearBookmarksButton() {
    const clearBookmarksButton = document.getElementById('clearBookmarksButton');
    if (bookmarks.length > 0) {
        clearBookmarksButton.style.display = 'block';
    } else {
        clearBookmarksButton.style.display = 'none';
    }
}

// Função para remover todas as marcações e ícones
function clearAllBookmarks() {
    bookmarks.forEach(page => {
        removeBookmarkIcon(page);
    });
    bookmarks = [];
    renderBookmarks();
    saveBookmarks();
    toggleClearBookmarksButton(); // Esconde o botão após a remoção
}

// Evento de clique no ícone de bookmark inicial (se existir)
document.querySelector('.icon-book-mark').addEventListener('click', toggleBookmark);

// Adiciona o evento de clique para o botão de limpar todas as marcações
document.getElementById('clearBookmarksButton').addEventListener('click', clearAllBookmarks);

// Carregar marcações ao iniciar
loadBookmarks();






let db_v2;

function initDB_v2() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('mealDB_v2', 1);

        request.onupgradeneeded = function (event) {
            db_v2 = event.target.result;
            const objectStore = db_v2.createObjectStore('meals_v2', { keyPath: 'id', autoIncrement: true });
            objectStore.createIndex('time', 'time', { unique: false });
            objectStore.createIndex('meal', 'meal', { unique: false });
            objectStore.createIndex('food', 'food', { unique: false });
            objectStore.createIndex('quantity', 'quantity', { unique: false });
            objectStore.createIndex('completed', 'completed', { unique: false });
        };

        request.onsuccess = function (event) {
            db_v2 = event.target.result;
            resolve();
        };

        request.onerror = function (event) {
            reject('Erro ao abrir o IndexedDB: ' + event.target.errorCode);
        };
    });
}

document.addEventListener("DOMContentLoaded", async function () {
    try {
        await initDB_v2();
        loadMeals_v2();
    } catch (error) {
        console.error(error);
    }
});

function loadMeals_v2() {
    if (!db_v2) return;

    const transaction = db_v2.transaction(['meals_v2'], 'readonly');
    const objectStore = transaction.objectStore('meals_v2');

    objectStore.openCursor().onsuccess = function (event) {
        const cursor = event.target.result;
        if (cursor) {
            const meal = cursor.value;
            // Passa o estado 'completed' corretamente para a função addMealToTable_v2
            addMealToTable_v2(meal.time, meal.meal, meal.food, meal.quantity, meal.id, meal.completed);
            cursor.continue();
        }
    };
}

function saveMeals_v2() {
    if (!db_v2) return;

    const table = document.getElementById('diet-table').getElementsByTagName('tbody')[0];
    const rows = table.getElementsByTagName('tr');

    const transaction = db_v2.transaction(['meals_v2'], 'readwrite');
    const objectStore = transaction.objectStore('meals_v2');

    objectStore.clear().onsuccess = function () {
        for (let i = 0; i < rows.length; i++) {
            const cells = rows[i].getElementsByTagName('td');
            const completed = rows[i].style.textDecoration === 'line-through';
            const meal = {
                time: cells[0].textContent,
                meal: cells[1].textContent,
                food: cells[2].textContent,
                quantity: cells[3].textContent,
                completed: completed
            };
            objectStore.add(meal).onsuccess = function () {
                console.log('Refeição salva:', meal); // Log para confirmar o que foi salvo
            };
        }
    };
}

function addMeal_v2() {
    const time = document.getElementById('time').value;
    const meal = document.getElementById('meal').value;
    const food = document.getElementById('food').value;
    const quantity = document.getElementById('quantity').value;

    if (time && meal && food && quantity) {
        addMealToTable_v2(time, meal, food, quantity);
        saveMeals_v2();
        document.getElementById('time').value = '';
        document.getElementById('meal').value = '';
        document.getElementById('food').value = '';
        document.getElementById('quantity').value = '';
    } else {
        alert('Por favor, preencha todos os campos.');
    }
}

function addMealToTable_v2(time, meal, food, quantity, id = null, completed = false) {
    const table = document.getElementById('diet-table').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();

    const timeCell = newRow.insertCell(0);
    const mealCell = newRow.insertCell(1);
    const foodCell = newRow.insertCell(2);
    const quantityCell = newRow.insertCell(3);
    const actionsCell = newRow.insertCell(4);

    timeCell.textContent = time;
    mealCell.textContent = meal;
    foodCell.textContent = food;
    quantityCell.textContent = quantity;

    const completeButton = document.createElement('button');
    completeButton.textContent = 'V';
    completeButton.classList.add('minha-classe');
    completeButton.onclick = function () {
        completeMeal_v2(this, id);
    };

    actionsCell.appendChild(completeButton);

    if (completed) {
        completeMeal_v2(completeButton, id, true);
    }
}

function completeMeal_v2(button, id, loading = false) {
    const row = button.parentElement.parentElement;
    row.style.position = 'relative';
    row.style.color = 'rgba(7, 156, 14, 0.24)';
    row.style.backgroundColor = 'rgba(240, 248, 255, 0.438)';
    row.style.setProperty('--line-through-color', 'red');
    row.style.textDecoration = 'line-through';

    if (!loading) {
        if (!db_v2) return;

        const transaction = db_v2.transaction(['meals_v2'], 'readwrite');
        const objectStore = transaction.objectStore('meals_v2');
        const getRequest = objectStore.get(id);

        getRequest.onsuccess = function (event) {
            const data = event.target.result;
            if (data) {
                data.completed = true;
                objectStore.put(data).onsuccess = function () {
                    console.log('Estado de completed atualizado para o id:', id); // Log para confirmar a atualização
                };
            } else {
                console.error('Refeição não encontrada com o id:', id);
            }
        };

        getRequest.onerror = function () {
            console.error('Erro ao recuperar a refeição com o id:', id);
        };
    }
}

function clearTable_v2() {
    if (confirm('Tem certeza que deseja remover todos os itens da tabela?')) {
        const tableBody = document.getElementById('diet-table').getElementsByTagName('tbody')[0];

        while (tableBody.firstChild) {
            tableBody.removeChild(tableBody.firstChild);
        }

        if (!db_v2) return;

        const transaction = db_v2.transaction(['meals_v2'], 'readwrite');
        const objectStore = transaction.objectStore('meals_v2');
        objectStore.clear().onsuccess = function () {
            console.log('Todas as refeições foram removidas do banco de dados.'); // Log para confirmar a remoção
        };
    }
}

document.getElementById('clear-table-button').addEventListener('click', clearTable_v2);


document.addEventListener("DOMContentLoaded", () => {
    const fileInput = document.getElementById('fileInput');
    let selectedContainer = null;
    let db;

    function initDB() {
        const request = indexedDB.open('galleryDB', 1);

        request.onupgradeneeded = function (event) {
            db = event.target.result;
            const objectStore = db.createObjectStore('images', { keyPath: 'index' });
            objectStore.createIndex('index', 'index', { unique: true });
        };

        request.onsuccess = function (event) {
            db = event.target.result;
            console.log('Banco de dados inicializado.');
            loadImages(); // Carrega as imagens após a inicialização do banco
        };

        request.onerror = function (event) {
            console.error('Erro ao abrir o IndexedDB:', event.target.errorCode);
        };
    }

    function loadImages() {
        if (!db) {
            console.error('O banco de dados não está inicializado.');
            return;
        }

        const transaction = db.transaction(['images'], 'readonly');
        const objectStore = transaction.objectStore('images');

        objectStore.openCursor().onsuccess = function (event) {
            const cursor = event.target.result;
            if (cursor) {
                const image = cursor.value;
                const container = document.querySelector(`.g-Container[data-index="${image.index}"]`);
                if (container && image.dataUrl) {
                    container.style.backgroundImage = `url(${image.dataUrl})`;
                    container.style.backgroundSize = 'cover';
                    container.style.backgroundPosition = 'center center';
                    container.style.backgroundRepeat = 'no-repeat';
                    console.log(`Imagem carregada no contêiner ${image.index}`);
                } else {
                    console.error(`Contêiner não encontrado para o índice: ${image.index}`);
                }
                cursor.continue();
            } else {
                console.log('Todas as imagens foram carregadas.');
            }
        };
    }

    function saveImage(imageDataUrl, index) {
        if (!db) {
            console.error('O banco de dados não está inicializado.');
            return;
        }

        const transaction = db.transaction(['images'], 'readwrite');
        const objectStore = transaction.objectStore('images');
        const image = { index: index, dataUrl: imageDataUrl, date: new Date().toISOString() };

        const request = objectStore.put(image);

        request.onsuccess = function () {
            console.log('Imagem salva no IndexedDB:', image);
        };

        request.onerror = function (event) {
            console.error('Erro ao salvar imagem no IndexedDB:', event.target.errorCode);
        };
    }

    function resizeImage(file, callback) {
        const reader = new FileReader();
        reader.onload = function (event) {
            const img = new Image();
            img.onload = function () {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                const maxDim = 1000; // Tamanho máximo de largura ou altura
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxDim) {
                        height *= maxDim / width;
                        width = maxDim;
                    }
                } else {
                    if (height > maxDim) {
                        width *= maxDim / height;
                        height = maxDim;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                ctx.drawImage(img, 0, 0, width, height);
                const resizedDataUrl = canvas.toDataURL('image/png');
                callback(resizedDataUrl);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }

    fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (file && selectedContainer) {
            const index = parseInt(selectedContainer.getAttribute('data-index'));
            console.log('Contêiner selecionado:', selectedContainer);
            resizeImage(file, function (resizedImageUrl) {
                selectedContainer.style.backgroundImage = `url(${resizedImageUrl})`;
                selectedContainer.style.backgroundSize = 'cover';
                selectedContainer.style.backgroundPosition = 'center center';
                selectedContainer.style.backgroundRepeat = 'no-repeat';
                saveImage(resizedImageUrl, index);



                const reader = new FileReader();
                reader.onload = (e) => {
                    // Adiciona a imagem como background do contêiner
                    selectedContainer.style.backgroundImage = `url(${e.target.result})`;

                    // Captura a data e hora da adição da imagem
                    const now = new Date();
                    const nowISO = now.toISOString();

                    // Armazena a data/hora no contêiner em formato ISO e no localStorage
                    selectedContainer.dataset.addedTime = nowISO;
                    localStorage.setItem(selectedContainer.id + '-addedTime', nowISO); // Salva a data/hora no localStorage usando o ID do contêiner
                };

                reader.readAsDataURL(file);

            });


        }
    });



    document.querySelectorAll('.g-Container').forEach(container => {
        // Tenta carregar a data/hora do localStorage ao carregar a página
        const savedTime = localStorage.getItem(container.id + '-addedTime');
        if (savedTime) {
            container.dataset.addedTime = savedTime; // Recupera e salva no dataset
        }

        container.addEventListener('click', () => {
            if (container.style.backgroundImage) {
                // Expande a imagem ao clicar se o contêiner já tiver uma imagem
                const imageUrl = container.style.backgroundImage.slice(5, -2);
                if (imageUrl) {
                    const fullScreenDiv = document.createElement('div');
                    fullScreenDiv.style.position = 'fixed';
                    fullScreenDiv.style.top = '0';
                    fullScreenDiv.style.left = '0';
                    fullScreenDiv.style.width = '100%';
                    fullScreenDiv.style.height = '100%';
                    fullScreenDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                    fullScreenDiv.style.backgroundImage = `url(${imageUrl})`;
                    fullScreenDiv.style.backgroundSize = 'contain';
                    fullScreenDiv.style.backgroundPosition = 'center center';
                    fullScreenDiv.style.backgroundRepeat = 'no-repeat';
                    fullScreenDiv.style.zIndex = '1000';

                    // Exibe a data/hora em que a imagem foi adicionada
                    const infoParagraph = document.createElement('p');

                    // Tenta obter a data armazenada no dataset (recuperado do localStorage)
                    const addedTimeISO = container.dataset.addedTime;
                    const addedTime = new Date(addedTimeISO); // Converte o string ISO de volta em objeto Date

                    // Verifica se a data é válida
                    if (!isNaN(addedTime)) {
                        const daysOfWeek = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
                        const day = daysOfWeek[addedTime.getDay()];
                        const hours = addedTime.getHours().toString().padStart(2, '0');
                        const minutes = addedTime.getMinutes().toString().padStart(2, '0');
                        infoParagraph.textContent = `Imagem adicionada em: ${day}, às ${hours}:${minutes}`;
                    } else {
                        infoParagraph.textContent = 'Data de adição inválida';
                    }

                    infoParagraph.style.color = 'white';
                    infoParagraph.style.position = 'fixed';
                    infoParagraph.style.bottom = '100px';
                    infoParagraph.style.left = '50%';
                    infoParagraph.style.transform = 'translateX(-50%)';
                    infoParagraph.style.zIndex = '1001';

                    fullScreenDiv.addEventListener('click', () => {
                        document.body.removeChild(fullScreenDiv);
                        document.body.removeChild(infoParagraph);
                    });

                    document.body.appendChild(fullScreenDiv);
                    document.body.appendChild(infoParagraph);
                }
            } else {
                // Seleciona o contêiner e abre o diálogo de seleção de arquivo se não houver imagem
                selectedContainer = container;
                fileInput.click(); // Abre o diálogo para seleção de arquivo
            }
        });
    });

    // Inicializa o IndexedDB
    initDB();

    // Limpa todas as imagens da galeria e do IndexedDB
    document.querySelector('.clean_unique').addEventListener('click', () => {
        if (confirm('Tem certeza que deseja limpar todas as imagens?')) {
            document.querySelectorAll('.g-Container').forEach(container => {
                container.style.backgroundImage = '';
            });

            // Limpa todas as imagens do IndexedDB
            if (db) {
                const transaction = db.transaction(['images'], 'readwrite');
                const objectStore = transaction.objectStore('images');
                const clearRequest = objectStore.clear();

                clearRequest.onsuccess = function () {
                    console.log('Todas as imagens foram removidas do IndexedDB.');
                };

                clearRequest.onerror = function (event) {
                    console.error('Erro ao remover imagens do IndexedDB:', event.target.errorCode);
                };
            } else {
                console.error('O banco de dados não está inicializado.');
            }
        }
    });
});


const canvasCare = document.getElementById('confettiCanvasCare');
const ctxCare = canvasCare.getContext('2d');

canvasCare.width = window.innerWidth;
canvasCare.height = window.innerHeight;

const colorsCare = ['#BF0A2B', '#F2AE2E', '#A0020D', '#F26513', '#F26513', '#D9310B'];

function createConfettiCare() {
    return {
        x: Math.random() * canvasCare.width,
        y: canvasCare.height + (Math.random() * canvasCare.height),
        size: Math.random() * 5 + 2,
        speedX: Math.random() * 3 - 1.5,
        speedY: -(Math.random() * 5 + 2),
        color: colorsCare[Math.floor(Math.random() * colorsCare.length)],
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 0.1 - 0.05
    };
}

const confettiArrayCare = Array.from({ length: 50 }, createConfettiCare); // Diminuiu para 50 confetes

function animateConfettiCare() {
    ctxCare.clearRect(0, 0, canvasCare.width, canvasCare.height);

    confettiArrayCare.forEach(confettiCare => {
        confettiCare.x += confettiCare.speedX;
        confettiCare.y += confettiCare.speedY;
        confettiCare.rotation += confettiCare.rotationSpeed;

        ctxCare.save();
        ctxCare.translate(confettiCare.x, confettiCare.y);
        ctxCare.rotate(confettiCare.rotation * Math.PI / 180);
        ctxCare.fillStyle = confettiCare.color;
        ctxCare.fillRect(-confettiCare.size / 2, -confettiCare.size / 2, confettiCare.size, confettiCare.size);
        ctxCare.restore();

        if (confettiCare.y < 0) {
            confettiCare.y = canvasCare.height + confettiCare.size; // Apenas reposiciona
            confettiCare.speedY = -(Math.random() * 5 + 2);
        }
    });

    setTimeout(() => {
        requestAnimationFrame(animateConfettiCare);
    }, 1000 / 120); // Limita para 30 FPS
}

animateConfettiCare();

window.addEventListener('resize', () => {
    canvasCare.width = window.innerWidth;
    canvasCare.height = window.innerHeight;
});


const skies = document.querySelectorAll('.sky');
const starCount = 70; // Número reduzido de estrelas

// Função para criar e adicionar estrelas a um container
function createStars(sky) {
    for (let i = 0; i < starCount; i++) {
        let star = document.createElement('div');
        star.className = 'star';

        // Posição aleatória
        star.style.top = Math.random() * window.innerHeight + 'px';
        star.style.left = Math.random() * window.innerWidth + 'px';

        // Alternar entre estrelas animadas e estáticas
        if (i % 3 === 0) {
            // Estrelas fixas
            star.className += ' static-star';
        } else {
            // Duração aleatória da animação
            star.style.animationDuration = `${Math.random() * 13 + 2}s`;
        }

        sky.appendChild(star);
    }
}

// Iterar sobre cada container .sky e adicionar as estrelas
skies.forEach(sky => createStars(sky));




const containers = document.querySelectorAll('.container_bubble');
const bubbleCount = 20;

// Função para criar uma bolha e adicionar ao DOM
function createBubbleElement(container) {
    const bubble = document.createElement('div');
    bubble.className = 'bubble';

    // Tamanho aleatório da bolha
    let size = Math.random() * 60 + 20;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;

    // Posição inicial aleatória
    bubble.style.left = `${Math.random() * 100}vw`;

    container.appendChild(bubble);
    return bubble;
}

// Função para animar as bolhas
function animateBubbles(bubbles) {
    bubbles.forEach(bubble => {
        // Definir nova posição inicial e duração da animação
        bubble.style.animation = `rise ${Math.random() * 5 + 5}s linear infinite`;
        bubble.style.left = `${Math.random() * 100}vw`;
    });
}

// Iterar sobre cada container e adicionar as bolhas
containers.forEach(container => {
    const bubbles = [];
    for (let i = 0; i < bubbleCount; i++) {
        const bubble = createBubbleElement(container);
        bubbles.push(bubble);
    }
    animateBubbles(bubbles);
});



const fireContainer = document.getElementById('fire-container');

function createFireParticle() {
    const particle = document.createElement('div');
    particle.className = 'fire-particle';

    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;

    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;

    fireContainer.appendChild(particle);

    setTimeout(() => {
        fireContainer.removeChild(particle);
    }, 2000);
}

setInterval(createFireParticle, 100);





document.addEventListener("DOMContentLoaded", function () {
    const unhasCronoTaskInput = document.getElementById("unhas_crono_task_input");
    const unhasCronoDaySelect = document.getElementById("unhas_crono_day_select");
    const unhasCronoAddTaskBtn = document.getElementById("unhas_crono_add_task_btn");
    const unhasCronoTaskList = document.getElementById("unhas_crono_task_list");
    const mandatoryCheck = document.getElementById("mandatoryCheck");

    // Função para obter o dia da semana atual
    function getCurrentDay() {
        const days = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
        return days[new Date().getDay()];
    }



    // Função para abrir o banco de dados IndexedDB
    function openDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open("user_crono", 1);

            request.onupgradeneeded = function (event) {
                const db = event.target.result;
                if (!db.objectStoreNames.contains("tasks")) {
                    db.createObjectStore("tasks", { keyPath: "id", autoIncrement: true });
                }
            };

            request.onsuccess = function (event) {
                resolve(event.target.result);
            };

            request.onerror = function () {
                reject("Erro ao abrir o IndexedDB.");
            };
        });
    }

    // Função para salvar a tarefa no IndexedDB
    function saveTask(day, task, isCompleted, animate = false) {
        openDatabase()
            .then(db => {
                const transaction = db.transaction(["tasks"], "readwrite");
                const store = transaction.objectStore("tasks");
                const request = store.add({ day, task, isCompleted });

                request.onsuccess = function () {
                    createTaskElement(day, task, isCompleted, request.result, animate);
                };
            })
            .catch(console.error);
    }

    // Função para carregar as tarefas do IndexedDB
    function loadTasks() {
        openDatabase()
            .then(db => {
                const transaction = db.transaction(["tasks"], "readonly");
                const store = transaction.objectStore("tasks");
                const request = store.getAll();

                request.onsuccess = function () {
                    const tasks = request.result;
                    tasks.forEach(task => {
                        createTaskElement(task.day, task.task, task.isCompleted, task.id);
                    });
                };
            })
            .catch(console.error);
    }

    // Função para criar e adicionar um elemento de tarefa na lista
    function createTaskElement(day, task, isCompleted = false, id, animate = false) {
        const listItem = document.createElement("li");
        listItem.className = "unhas_crono_item";
        listItem.dataset.id = id;

        const dayElement = document.createElement("span");
        dayElement.className = "unhas_crono_date";
        dayElement.textContent = day;

        const taskElement = document.createElement("span");
        taskElement.className = "unhas_crono_task";

        function animateTaskText(taskText) {
            taskElement.innerHTML = ""; // Limpa o conteúdo anterior
            taskText.split("").forEach((char, index) => {
                const span = document.createElement("span");
                span.classList.add(char === " " ? "text-space" : "text-letter");
                span.textContent = char === " " ? "\u00A0" : char; // Adiciona espaço não-quebrante para espaços
                taskElement.appendChild(span);

                // Aplica a animação gradualmente ao adicionar
                if (animate) {
                    setTimeout(() => {
                        span.classList.add("show");
                    }, index * 50); // Controla o tempo entre as letras
                } else {
                    span.style.opacity = 1; // Define a opacidade sem animação
                }
            });
        }

        // Inicializa a animação das letras
        animateTaskText(task);




        // Adiciona evento de clique diretamente na tarefa
        taskElement.addEventListener("click", function () {
            console.log(new Date().getFullYear())
            if (mandatoryCheck.checked && getCurrentDay() !== day) {
                console.log(mandatoryCheck)
                alert(`Você só pode marcar essa tarefa na ${day}. Hoje é ${getCurrentDay()}.`);
                return;
            }

            listItem.classList.toggle("unhas_crono_completed");
            updateTask(parseInt(listItem.dataset.id), listItem.classList.contains("unhas_crono_completed"));
        });

        if (isCompleted) {
            listItem.classList.add("unhas_crono_completed");
        }

        const removeBtn = document.querySelector('.unhas_crono_remove_btn');

        removeBtn.addEventListener("click", function () {
            const taskId = parseInt(listItem.dataset.id); // Obtém o ID da tarefa
            removeTask(taskId); // Remove a tarefa do banco de dados
            listItem.remove(); // Remove o elemento da lista
        });


        const completeButton = document.createElement("div");
        completeButton.className = "complete-btn";
        completeButton.textContent = "Concluir";

        completeButton.addEventListener("click", function () {
            // Se o mandatoryCheck estiver marcado, verifica o dia
            if (mandatoryCheck.checked) {
                if (getCurrentDay() !== day) {
                    alert(`Você só pode marcar essa tarefa na ${day}. Hoje é ${getCurrentDay()}.`);
                    return;
                }
            }

            // Se o mandatoryCheck não estiver marcado, ou o dia for correto, permite completar a tarefa
            listItem.classList.toggle("completed"); // Adiciona um efeito visual para tarefas concluídas
            // Aqui você pode incluir o efeito específico aplicado ao clicar na tarefa
        });


        listItem.appendChild(dayElement);
        listItem.appendChild(taskElement);

        listItem.appendChild(completeButton); // Adiciona o botão "Concluir" ao item
        unhasCronoTaskList.appendChild(listItem);
    }

    // Adicionar uma nova tarefa com animação
    unhasCronoAddTaskBtn.addEventListener("click", function () {
        const task = unhasCronoTaskInput.value.trim();
        const day = unhasCronoDaySelect.value;
        if (task) {
            saveTask(day, task, false, true); // Passa true para ativar animação
            unhasCronoTaskInput.value = ""; // Limpar o campo de entrada
        }
    });


    function removeTask(id) {
        openDatabase().then(db => {
            const transaction = db.transaction(["tasks"], "readwrite");
            const store = transaction.objectStore("tasks");
            store.delete(id);
        }).catch(console.error);
    }


    // Carregar tarefas ao carregar a página
    loadTasks();
});


// Selecionar os elementos necessários
const unhasCronoAddItemCall = document.querySelector(".add-item-call");
const unhasCronoPopup = document.getElementById("unhas_crono_popup");
const unhasCronoClosePopup = document.querySelector(".unhas_crono_close_popup");

// Função para abrir o pop-up
unhasCronoAddItemCall.addEventListener("click", function () {
    unhasCronoPopup.classList.remove("hidden");
});

// Função para fechar o pop-up
unhasCronoClosePopup.addEventListener("click", function () {
    unhasCronoPopup.classList.add("hidden");
});

// Fechar o pop-up se o usuário clicar fora do conteúdo do pop-up
window.addEventListener("click", function (event) {
    if (event.target === unhasCronoPopup) {
        unhasCronoPopup.classList.add("hidden");
    }
});



const videoPlayer = document.getElementById('videoPlayer');
const videoLinkInput = document.getElementById('videoLink');
const playlist = document.getElementById('playlist_youtubevideo');
const popup = document.getElementById('youtube_videos_playlist');
const closeButton = document.getElementById('youtube_videos_playlist_close');
const openPlaylistButton = document.getElementById('openPlaylistButton');

let db_playlist;
let videoList = [];

// Inicializa o IndexedDB
function initDB() {
    const request = indexedDB.open('youtube_add_data', 1);

    request.onupgradeneeded = function (event) {
        db_playlist = event.target.result;
        if (!db_playlist.objectStoreNames.contains('videos')) {
            db_playlist.createObjectStore('videos', { keyPath: 'id', autoIncrement: true });
        }
    };

    request.onsuccess = function (event) {
        db_playlist = event.target.result;
        loadVideos();
    };

    request.onerror = function (event) {
        console.error('Erro ao abrir o IndexedDB:', event.target.errorCode);
    };
}

// Carrega os vídeos do IndexedDB
function loadVideos() {
    const transaction = db_playlist.transaction(['videos'], 'readonly');
    const objectStore = transaction.objectStore('videos');
    const request = objectStore.getAll();

    request.onsuccess = function (event) {
        videoList = event.target.result;
        renderPlaylist();
    };

    request.onerror = function (event) {
        console.error('Erro ao carregar os vídeos:', event.target.errorCode);
    };
}

// Salva um vídeo no IndexedDB
function saveVideo(video) {
    const transaction = db_playlist.transaction(['videos'], 'readwrite');
    const objectStore = transaction.objectStore('videos');
    objectStore.add(video);

    transaction.oncomplete = function () {
        loadVideos();
    };

    transaction.onerror = function (event) {
        console.error('Erro ao salvar o vídeo:', event.target.errorCode);
    };
}

// Atualiza um vídeo no IndexedDB
function updateVideo(index, updatedVideo) {
    const transaction = db_playlist.transaction(['videos'], 'readwrite');
    const objectStore = transaction.objectStore('videos');
    const request = objectStore.get(videoList[index].id);

    request.onsuccess = function (event) {
        const video = event.target.result;
        video.name = updatedVideo.name;

        const updateRequest = objectStore.put(video);

        updateRequest.onsuccess = function () {
            loadVideos();
        };

        updateRequest.onerror = function (event) {
            console.error('Erro ao atualizar o vídeo:', event.target.errorCode);
        };
    };
}

// Deleta um vídeo do IndexedDB
function deleteVideo(index) {
    if (confirm('Tem certeza que deseja deletar este vídeo?')) {
        const transaction = db_playlist.transaction(['videos'], 'readwrite');
        const objectStore = transaction.objectStore('videos');
        const request = objectStore.delete(videoList[index].id);

        request.onsuccess = function () {
            loadVideos();
        };

        request.onerror = function (event) {
            console.error('Erro ao deletar o vídeo:', event.target.errorCode);
        };
    }
}

// Função para renderizar a playlist na tela
function renderPlaylist() {
    playlist.innerHTML = '';
    videoList.forEach((video, index) => {
        const li = document.createElement('li');
        li.className = 'playlist-item';

        const span = document.createElement('div');
        span.textContent = video.name || `Vídeo ${index + 1}`;
        span.addEventListener('click', () => playVideo(video.url, li));

        const renameButton = document.createElement('button');
        renameButton.textContent = 'Renomear';
        renameButton.className = 'rename-button';
        renameButton.addEventListener('click', (e) => {
            e.stopPropagation();
            renameVideo(index);
        });

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Deletar';
        deleteButton.className = 'delete-button';
        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteVideo(index);
        });

        const make_center_element = document.createElement('div')
        make_center_element.className = "center_itens"
        make_center_element.appendChild(renameButton)
        make_center_element.appendChild(deleteButton)
        li.appendChild(make_center_element)
        li.appendChild(span);
        playlist.appendChild(li);
    });
}

async function fetchVideoData(videoId) {
    const apiKey = 'AIzaSyCxTU-MxPJaKKfQ8YrUQgW5lKdaR3ubX0A'; // Insira sua chave da API do YouTube aqui
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.items.length > 0) {
            const videoDetails = data.items[0].snippet;
            console.log('Título:', videoDetails.title);
            console.log('Descrição:', videoDetails.description);
            console.log('Nome do canal:', videoDetails.channelTitle);
            console.log('Thumbnail:', videoDetails.thumbnails.high.url);
            // Adicione as informações ao vídeo
            return {
                title: videoDetails.title,
                description: videoDetails.description,
                channelTitle: videoDetails.channelTitle,
                thumbnail: videoDetails.thumbnails.high.url,
            };
        } else {
            console.error('Nenhum vídeo encontrado com o ID fornecido.');
        }
    } catch (error) {
        console.error('Erro ao buscar dados do vídeo:', error);
    }
}





// Função para adicionar vídeos à playlist
// Função para adicionar vídeos à playlist com dados adicionais
document.getElementById('addVideo').addEventListener('click', async () => {
    const link = videoLinkInput.value;
    const videoId = extractYouTubeID(link);

    if (videoId) {
        const videoData = await fetchVideoData(videoId);
        const url = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        const video = {
            id: videoId,
            url,
            name: videoData.title || `Vídeo ${videoList.length + 1}`,
            thumbnail: videoData.thumbnail,
            channelTitle: videoData.channelTitle,
        };

        saveVideo(video);
        videoLinkInput.value = '';
        openPopup();
    } else {
        alert('Por favor, insira um link válido do YouTube.');
    }
});


// Função para tocar o vídeo selecionado e exibi-lo em fullscreen
function playVideo(url, listItem) {
    const fullScreenDiv = document.createElement('div');
    fullScreenDiv.style.position = 'fixed';
    fullScreenDiv.style.top = '0';
    fullScreenDiv.style.left = '0';
    fullScreenDiv.style.width = '100%';
    fullScreenDiv.style.height = '100%';
    fullScreenDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    fullScreenDiv.style.zIndex = '1000';
    fullScreenDiv.style.display = 'flex';
    fullScreenDiv.style.alignItems = 'center';
    fullScreenDiv.style.justifyContent = 'center';

    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.width = '100%';
    iframe.style.height = '50%';
    iframe.style.border = 'none';
    iframe.allow = 'autoplay';

    fullScreenDiv.appendChild(iframe);

    fullScreenDiv.addEventListener('click', (e) => {
        if (e.target === fullScreenDiv) {
            document.body.removeChild(fullScreenDiv);
        }
    });

    document.body.appendChild(fullScreenDiv);
}

// Função para renomear o vídeo
function renameVideo(index) {
    const newName = prompt('Digite o novo nome do vídeo:', videoList[index].name || `Vídeo ${index + 1}`);
    if (newName) {
        videoList[index].name = newName;
        updateVideo(index, videoList[index]);
    }
}

// Função para extrair o ID do vídeo do link do YouTube
function extractYouTubeID(url) {
    const regExp = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regExp);
    return match ? match[1] : null;
}

// Função para abrir o pop-up com animação
function openPopup() {
    popup.classList.add('open');
}

// Evento para o botão "Abrir Playlist"
openPlaylistButton.addEventListener('click', openPopup);

// Função para fechar o pop-up
closeButton.addEventListener('click', () => {
    popup.classList.remove('open');
    videoPlayer.src = '';
});

// Carrega a playlist quando a página é carregada
document.addEventListener('DOMContentLoaded', initDB);




document.addEventListener("DOMContentLoaded", () => {
    const giftDiv = document.querySelector('.gift');
    const popUpGift = document.getElementById('pop-up-gift');
    const closeButton_gift = document.querySelector('.close-btn_gift');
    console.log(closeButton_gift);

    giftDiv.addEventListener('click', () => {
        popUpGift.style.display = 'block';
    });

    closeButton_gift.addEventListener('click', () => {
        popUpGift.style.display = 'none';
    });

})



function stars_foguete() {
    const count = 20;
    const scene = document.querySelector('.scene');
    const fragment = document.createDocumentFragment(); // Use fragment for better performance

    for (let i = 0; i < count; i++) {
        const star = document.createElement('i');
        const x = Math.floor(Math.random() * window.innerWidth);
        const duration = 0.5 + Math.random() * 0.5; // Use a more controlled range for duration
        const h = Math.random() * 100;

        star.style.position = 'absolute'; // Ensure position style is set
        star.style.left = `${x}px`;
        star.style.width = '1px';
        star.style.height = `${h}px`;
        star.style.animationDuration = `${duration}s`;
        star.style.willChange = 'transform'; // Suggest browser optimizations

        // Optional: Add a translate transform instead of left adjustment for better GPU use
        star.style.transform = `translateX(${x}px)`;
        fragment.appendChild(star);
    }

    scene.appendChild(fragment); // Append all stars at once
}

stars_foguete();


// Seleciona os elementos
const interrogacao = document.querySelector('.interrogacao');
const popup_inter = document.querySelector('.interrogacao_pop_up');
const startTourButton = document.getElementById('startTourButton_for-inter');
const closePopupButton = document.getElementById('closePopupButton-for-inter');

// Mostra o pop-up quando a div "interrogacao" é clicada
interrogacao.addEventListener('click', function () {
    popup_inter.style.display = 'block';
});

// Inicia o introJs se o usuário clicar em "Sim"
startTourButton.addEventListener('click', function () {
    popup_inter.style.display = 'none'; // Esconde o pop-up

    // Seleciona apenas os elementos do grupo2
    const elementosDoGrupo2 = document.querySelectorAll('[data-tour="grupo2"]');

    // Configura o introJs para usar apenas os elementos do grupo2
    introJs().setOptions({
        steps: Array.from(elementosDoGrupo2).map(el => ({
            element: el,
            intro: el.getAttribute('data-intro'),
            position: el.getAttribute('data-position') || 'bottom',
        }))
    }).start(); // Inicia o tour com os elementos filtrados
});

// Fecha o pop-up se o usuário clicar em "Não"
closePopupButton.addEventListener('click', function () {
    popup_inter.style.display = 'none';
});



function reloadPage() {
    // Obtém o contador de recargas do localStorage ou define como 0 se não existir
    let reloadCount = parseInt(localStorage.getItem('reloadCount') || '0', 10);

    // Se o contador for menor que 3, recarrega a página e incrementa o contador
    if (reloadCount < 3) {
        reloadCount++;
        localStorage.setItem('reloadCount', reloadCount.toString()); // Atualiza o contador no localStorage

        // Recarrega a página definindo o mesmo URL
        window.location.href = window.location.href;
    } else {
        // Limpa o contador após a terceira recarga para não recarregar mais
        localStorage.removeItem('reloadCount');
        console.log('Página carregada após 3 recargas');
    }
}

// Chama a função de recarregar
reloadPage();




// document.addEventListener('DOMContentLoaded', () => {
//     const text = "Marcação obrigatória por dia";
//     const container = document.getElementById('text-container');
//     const checkbox = document.querySelector('.Check_inner');

//     function createSpans() {
//         container.innerHTML = '';
//         text.split('').forEach((char, index) => {
//             const span = document.createElement('span');
//             span.classList.add(char === ' ' ? 'text-space' : 'text-letter');
//             span.textContent = char === ' ' ? '\u00A0' : char; // Adiciona um espaço não-quebrante para os espaços
//             span.style.animationDelay = `${index * 0.1}s`; // Atraso para a animação de cada letra ao aparecer
//             container.appendChild(span);
//         });
//     }

//     function toggleText() {
//         const letters = document.querySelectorAll('.text-letter, .text-space');
//         letters.forEach((letter, index) => {
//             letter.classList.remove('show', 'hide');
//             const delay = checkbox.checked ? index * 100 : (letters.length - index - 1) * 100; // Atraso para desaparecer de trás para frente
//             setTimeout(() => {
//                 letter.classList.add(checkbox.checked ? 'show' : 'hide');
//             }, delay);
//         });
//     }

//     createSpans();
//     toggleText();

//     checkbox.addEventListener('change', toggleText);
// });


// Seleciona os elementos
const lupaDiv = document.querySelector('.lupa_image'); // Renomeado
const lupaPopup = document.querySelector('.lupa_popup'); // Renomeado
const lupaStartTourButton = document.getElementById('lupaStartTourButton'); // Renomeado
const lupaClosePopupButton = document.getElementById('lupaClosePopupButton'); // Renomeado

// Mostra o pop-up quando a div "lupa_image" é clicada
lupaDiv.addEventListener('click', function () {
    lupaPopup.style.display = 'block';
});

// Inicia o introJs se o usuário clicar em "Sim"
lupaStartTourButton.addEventListener('click', function () {
    lupaPopup.style.display = 'none'; // Esconde o pop-up

    // Seleciona apenas os elementos do grupo3
    const elementosDoGrupo3 = document.querySelectorAll('[data-tour="grupo3"]');

    // Configura o introJs para usar apenas os elementos do grupo3
    introJs().setOptions({
        steps: Array.from(elementosDoGrupo3).map(el => ({
            element: el,
            intro: el.getAttribute('data-intro'),
            step: el.getAttribute('data-step'),
            position: el.getAttribute('data-position') || 'bottom',
        }))
    }).start(); // Inicia o tour com os elementos do grupo3
});

// Fecha o pop-up se o usuário clicar em "Não"
lupaClosePopupButton.addEventListener('click', function () {
    lupaPopup.style.display = 'none';
});




// Seleciona a div diet_guide
const dietGuide = document.querySelector('.diet_guide');

// Adiciona o evento de clique para acionar o tour do grupo 4
dietGuide.addEventListener('click', function () {
    // Seleciona apenas os elementos do grupo4
    const elementosDoGrupo4 = document.querySelectorAll('[data-tour="grupo4"]');

    // Configura o introJs para usar apenas os elementos do grupo4
    introJs().setOptions({
        steps: Array.from(elementosDoGrupo4).map(el => ({
            element: el,
            intro: el.getAttribute('data-intro'),
            step: el.getAttribute('data-step'),
            position: el.getAttribute('data-position') || 'bottom',
        }))
    }).start(); // Inicia o tour com os elementos do grupo4
});


class Electricity {
    constructor(selector) {
        this.svg = document.querySelector(selector);
        this.intensity = 10; // Valor inicial de intensidade
        this.initControls();
        this.run();
    }

    // Função que renderiza o raio
    render() {
        let post1X = 0;
        let post1Y = 50;
        let post2X = this.svg.clientWidth;
        let post2Y = 50;

        let d = this.calculatePoints(post1X, post1Y, post2X, post2Y);
        this.svg.querySelectorAll('path')[0].setAttribute('d', d);
        this.svg.querySelectorAll('path')[1].setAttribute('d', d);
    }

    // Função que calcula os pontos aleatórios do raio
    calculatePoints(x, y, width, height) {
        let points = [[x, height]]; // Inicia no primeiro poste
        let maxPoints = this.intensity; // Número de pontos baseado na intensidade
        let chunkRange = width / maxPoints;

        for (let i = 1; i < maxPoints; i++) {
            let cx = chunkRange * i;
            let cy = Math.random() * 100; // Altura variável do raio
            points.push([cx, cy]);
        }

        points.push([width, height]); // Finaliza no segundo poste

        let d = points.map(point => point.join(',')).join(' L ');
        return 'M ' + d;
    }

    // Função que captura o valor do controle deslizante e ajusta a intensidade
    initControls() {
        const intensitySlider = document.getElementById('intensityRange');
        intensitySlider.addEventListener('input', (event) => {
            this.intensity = parseInt(event.target.value); // Define a nova intensidade
        });
    }

    // Função de loop que anima o raio
    run() {
        let fps = 25,
            now,
            delta,
            then = Date.now(),
            interval = 1000 / fps,
            iteration = 0,
            loop = () => {
                requestAnimationFrame(loop);

                now = Date.now();
                delta = now - then;
                if (delta > interval) {
                    then = now - (delta % interval);

                    // Atualiza a animação
                    this.render(iteration++);
                }
            }
        loop();
    }
}

// Inicializa a animação do raio com controle de intensidade
new Electricity('.electricity-svg');
















var rain = function () {
    $('.rain').empty();

    var increment = 0;
    var drops = "";

    while (increment < 95) {
        var randoHundo = (Math.floor(Math.random() * (98 - 1 + 1) + 1));
        var randoFiver = (Math.floor(Math.random() * (4 - 2 + 1) + 2));
        increment += randoFiver;
        drops += '<div class="drop" style="left: ' + increment + '%; bottom: ' + (randoFiver + randoFiver - 1 + 100) + '%; animation-delay: 0.' + randoHundo + 's; animation-duration: 0.5' + randoHundo + 's;"><div class="stem" style="animation-delay: 0.' + randoHundo + 's; animation-duration: 0.5' + randoHundo + 's;"></div><div class="splat" style="animation-delay: 0.' + randoHundo + 's; animation-duration: 0.5' + randoHundo + 's;"></div></div>';
    }

    $('.rain').append(drops);
}

rain();






document.querySelector('.pena_notation').addEventListener('click', function () {
    const popUp = document.getElementById('pena_notation-pop-up');
    popUp.classList.add('open');  // Adiciona a classe 'open' para aplicar a animação
});

document.getElementById('close-btn').addEventListener('click', function () {
    const popUp = document.getElementById('pena_notation-pop-up');
    popUp.classList.remove('open');  // Remove a classe 'open' para fechar o pop-up
});

// Fechar o pop-up ao clicar fora do conteúdo
window.addEventListener('click', function (event) {
    const popUp = document.getElementById('pena_notation-pop-up');
    if (event.target === popUp) {
        popUp.classList.remove('open');
    }
});











// Variáveis de controle do IndexedDB
let db_notation;

// Função para abrir/criar o banco de dados
function openDatabase() {
    const request = indexedDB.open('salvar_notation', 1);

    request.onupgradeneeded = function (event) {
        db_notation = event.target.result;
        const objectStore = db_notation.createObjectStore('notations', { autoIncrement: true });
        console.log('Banco de dados criado ou atualizado');
    };

    request.onsuccess = function (event) {
        db_notation = event.target.result;
        console.log('Banco de dados aberto com sucesso');
        loadNotationsFromDB(); // Carrega o conteúdo ao iniciar a página
    };

    request.onerror = function (event) {
        console.log('Erro ao abrir o banco de dados:', event.target.errorCode);
    };
}

// Função para adicionar uma anotação no banco de dados
function addNotationToDB(content) {
    const transaction = db_notation.transaction(['notations'], 'readwrite');
    const objectStore = transaction.objectStore('notations');
    objectStore.add(content);
}

// Função para carregar o conteúdo salvo no banco de dados
function loadNotationsFromDB() {
    const transaction = db_notation.transaction(['notations'], 'readonly');
    const objectStore = transaction.objectStore('notations');
    const request = objectStore.openCursor();

    request.onsuccess = function (event) {
        const cursor = event.target.result;
        if (cursor) {
            addContentToDOM(cursor.value); // Adiciona o conteúdo ao DOM
            cursor.continue();
        }
    };

    request.onerror = function (event) {
        console.log('Erro ao carregar o conteúdo do banco:', event.target.errorCode);
    };
}

// Função para apagar todas as anotações do banco de dados
function clearNotationsFromDB() {
    const transaction = db_notation.transaction(['notations'], 'readwrite');
    const objectStore = transaction.objectStore('notations');
    objectStore.clear();
}

// Função para adicionar o conteúdo ao DOM (usada ao carregar ou ao adicionar)
function addContentToDOM(content) {
    const newContent = document.createElement('p');
    newContent.className = "p_content_add_notation"; // Adiciona a classe para o fade-in

    // Função para adicionar o texto letra por letra
    let i = 0;
    function typeLetter() {
        if (i < content.length) {
            newContent.textContent += content.charAt(i); // Adiciona a letra
            i++;
            setTimeout(typeLetter, 100); // Define o intervalo entre as letras (100ms)
        }
    }

    // Começa a exibição letra por letra
    typeLetter();

    // Adiciona o conteúdo à div .folha-container
    folhaContainer.appendChild(newContent);
}

// Seleciona o botão e a textarea
const addButton = document.querySelector('.add-content-text-area-notation');
const textarea = document.getElementById('textarea-notation');
const folhaContainer = document.querySelector('.absolute_position_content'); // Agora o pai é .folha-container

// Função para adicionar o conteúdo da textarea
addButton.addEventListener('click', function () {
    const userInput = textarea.value; // Pega o valor do textarea

    if (userInput.trim() !== '') { // Verifica se não está vazio
        addContentToDOM(userInput); // Adiciona ao DOM
        addNotationToDB(userInput); // Salva no IndexedDB
        textarea.value = ''; // Limpa o textarea
    }
});

// Seleciona a div borracha_notation
const eraseButton = document.querySelector('.borracha_notation');

// Função para apagar todo o conteúdo do DOM e do banco de dados
eraseButton.addEventListener('click', function () {
    // Apaga o conteúdo da folha-container (DOM)
    folhaContainer.innerHTML = '';

    // Apaga o conteúdo do banco de dados
    clearNotationsFromDB();

    console.log('Conteúdo e banco de dados apagados');
});

// Abre o banco de dados ao carregar a página
openDatabase();




document.addEventListener('DOMContentLoaded', () => {
    const containers_custom = document.querySelectorAll('.container_custom'); // lista de todos os containers
    const numberOfDrops_custom = 1; // Número de gotas
    const dropInterval_custom = 1000; // Intervalo entre gotas em milissegundos

    containers_custom.forEach(container_custom => { // Iterar sobre cada container
        for (let i = 0; i < numberOfDrops_custom; i++) {
            setTimeout(() => createDrop_custom(container_custom), i * dropInterval_custom);
        }

        function createDrop_custom(container_custom) {
            const drop_custom = document.createElement('div');
            drop_custom.className = 'drop_custom';
            drop_custom.style.left = `${Math.random() * 100}%`; // Posiciona a gota aleatoriamente na largura da tela

            container_custom.appendChild(drop_custom);

            let cycleCount_custom = 0; // Contador de ciclos

            drop_custom.addEventListener('animationiteration', () => {
                if (cycleCount_custom <= 1) {
                    createTrail_custom(drop_custom, container_custom);
                    cycleCount_custom++;
                    drop_custom.style.left = `${Math.random() * 100}%`; // Reposiciona a gota aleatoriamente na largura da tela após cada iteração
                } else {
                    drop_custom.remove(); // Remove a gota após 10 ciclos
                }
            });
        }

        function createTrail_custom(drop_custom, container_custom) {
            const trailInterval_custom = setInterval(() => {
                const trail_custom = document.createElement('div');
                trail_custom.className = 'trail_custom';
                trail_custom.style.left = drop_custom.style.left;
                trail_custom.style.top = `${drop_custom.offsetTop}px`;
                container_custom.appendChild(trail_custom);
            }, 200); // Ajuste o intervalo conforme necessário

            // Parar a criação do rastro após a animação da gota ser concluída
            setTimeout(() => {
                clearInterval(trailInterval_custom);
            }, 3000); // Deve coincidir com a duração da animação da gota
        }
    });
});




const audioPlayer = document.getElementById('audioPlayer');
const speedButton = document.getElementById('speedButton');
const speedOptions = document.getElementById('speedOptions');

// Exibe/esconde as opções de velocidade ao clicar no botão
speedButton.addEventListener('click', function () {
    speedOptions.style.display = speedOptions.style.display === 'block' ? 'none' : 'block';
});

// Atualiza a velocidade do áudio quando uma opção é selecionada
speedOptions.addEventListener('click', function (e) {
    if (e.target.tagName === 'LI') {
        const speed = parseFloat(e.target.getAttribute('data-speed'));
        audioPlayer.playbackRate = speed;
        speedOptions.style.display = 'none'; // Esconde o menu após selecionar a velocidade
    }
});

// Fecha o menu se o usuário clicar fora dele
document.addEventListener('click', function (e) {
    if (!speedButton.contains(e.target) && !speedOptions.contains(e.target)) {
        speedOptions.style.display = 'none';
    }
});


const urls = [
    "https://unhasfortes.online/wp-content/uploads/2024/08/audio-1.jpg",
    "https://unhasfortes.online/wp-content/uploads/2024/08/audio-2.jpg",
    "https://unhasfortes.online/wp-content/uploads/2024/08/audio-3.jpg",
    "https://unhasfortes.online/wp-content/uploads/2024/08/audio-4.jpg",
    // Adicione mais URLs conforme necessário
];

// Índice inicial da fila de URLs
let currentIndex = 0;

// Função para mudar o background da div
function changeBackground() {
    // Seleciona a div com a classe "radius-content"
    const element = document.querySelector('.radius-cotent');

    // Atualiza o background com a URL atual
    element.style.backgroundImage = `url('${urls[currentIndex]}')`;

    // Incrementa o índice
    currentIndex++;

    // Se o índice atingir o fim do array, volta ao início
    if (currentIndex >= urls.length) {
        currentIndex = 0;
    }
}

// Chama a função pela primeira vez para iniciar o loop
changeBackground();

// Configura o intervalo para mudar o background a cada 10 segundos
setInterval(changeBackground, 10000); // 10000ms = 10 segundos




function setLightMode_toggle() {
    localStorage.setItem('theme', 'light-mode');
    applyTheme('light-mode');
}

function setDarkMode_toggle() {
    localStorage.setItem('theme', 'dark-mode');
    applyTheme('dark-mode');
}

function setCustomMode_toggle() {
    localStorage.setItem('theme', 'custom-mode');
    applyTheme('custom-mode');
}

function applyTheme(theme) {
    document.body.className = theme;
}

function ensureAtLeastOneChecked() {
    const toggles = document.querySelectorAll('.change_color_for_toggle');
    const checkedToggles = Array.from(toggles).filter(toggle => toggle.checked);
}

document.getElementById('light_mode_toggle').addEventListener('change', function () {
    if (this.checked) {
        setLightMode_toggle();
    }
    ensureAtLeastOneChecked();
});

document.getElementById('dark_mode_toggle').addEventListener('change', function () {
    if (this.checked) {
        setDarkMode_toggle();
    }
    ensureAtLeastOneChecked();
});

document.getElementById('custom_mode_toggle').addEventListener('change', function () {
    if (this.checked) {
        setCustomMode_toggle();
    }
    ensureAtLeastOneChecked();
});







function ensureAtLeastOneChecked() {
    const toggles = document.querySelectorAll('.change_fonts_for_toggle');
    const checkedToggles = Array.from(toggles).filter(toggle => toggle.checked);

    // Se todos forem desmarcados, reativa o último desmarcado
    if (checkedToggles.length === 0) {
        event.target.checked = true; // Reativa o último que foi desmarcado
    }
}

// Event listeners para cada toggle
document.getElementById('small_font_toggle').addEventListener('change', function () {
    if (this.checked) {
        setFontSize('0.8rem');
    }
    ensureAtLeastOneChecked();
});

document.getElementById('medium_font_toggle').addEventListener('change', function () {
    if (this.checked) {
        setFontSize('0.9rem');
    }
    ensureAtLeastOneChecked();
});

document.getElementById('large_font_toggle').addEventListener('change', function () {
    if (this.checked) {
        setFontSize('1rem');
    }
    ensureAtLeastOneChecked();
});
