// --- DOM Elements ---
const roomTitleElement = document.getElementById('room-title');
const roomDescriptionElement = document.getElementById('room-description');
const roomImageElement = document.getElementById('room-image');
const feedbackElement = document.getElementById('feedback');
const userInputElement = document.getElementById('user-input');
const actionButton = document.getElementById('action-button');
const inventoryListElement = document.getElementById('inventory-list');

// --- Game State ---
let currentRoom = 'room1';
let inventory = [];
const puzzlesSolved = {
    room1: false,
    room2: false,
    room3: false,
    room4: false,
    room5: false,
};

// --- Room Data ---
const rooms = {
    room1: {
        name: "Sala 1: La Biblioteca Olvidada",
        description: "Te encuentras en una biblioteca con estanterías llenas de polvo. La única puerta visible está cerrada con un candado numérico. Hay un escritorio viejo en una esquina y un cuadro torcido en la pared.",
        image: "images/room1.jpg",
        objects: {
            'estanterias': "Montones de libros viejos. Uno parece fuera de lugar, con el número '7' marcado en el lomo.",
            'escritorio': "Un escritorio de madera robusta. Tiene un cajón cerrado con llave. Encima hay un tintero seco y una pluma.",
            'cajon': "El cajón del escritorio está cerrado. Necesitas una llave pequeña.",
            'cuadro': "Un paisaje oscuro y sombrío. Al enderezarlo, descubres un papelito detrás con el número '3' escrito.",
            'puerta': "Una puerta de madera maciza con un candado numérico de 4 dígitos.",
            'libro': "El libro con el número '7'. Al abrirlo, encuentras otra nota con el número '1'.",
            'papelito': "Un pequeño papel con el número '3'.",
        },
        exits: {
            'puerta': { target: 'room2', locked: true, code: '7319' } // Pista final '9' estará en otro objeto
        },
        initialItems: [] // Items que podrían estar en la sala inicialmente
    },
    room2: {
        name: "Sala 2: El Pasadizo Húmedo",
        description: "Tras la puerta, un pasadizo estrecho y húmedo desciende en la oscuridad. En las paredes hay extraños símbolos grabados y una palanca oxidada.",
        image: "images/room2.jpg",
        objects: {
            'paredes': "Las paredes están frías y húmedas. Hay símbolos: un círculo, un cuadrado, un triángulo y una estrella.",
            'simbolos': "Círculo, Cuadrado, Triángulo, Estrella. Parecen botones que se pueden pulsar.",
            'palanca': "Una palanca de metal oxidada. Parece atascada.",
            'suelo': "El suelo de piedra está resbaladizo. Hay un pequeño charco en una esquina.",
        },
        exits: {
            'escaleras': { target: 'room3', locked: true } // Se desbloquea al resolver el puzzle
        },
        puzzle: {
            type: 'sequence',
            elements: ['circulo', 'estrella', 'cuadrado', 'triangulo'], // Orden correcto
            solvedMessage: "¡Click! Los símbolos se hunden en la pared y oyes un mecanismo. Un pequeño compartimento se abre revelando una nota arrugada.",
            reward: 'nota'
        },
        pressedSequence: [] // Para rastrear la secuencia pulsada por el jugador
    },
    room3: {
        name: "Sala 3: El Laboratorio Improvisado",
        description: "El pasadizo desemboca en lo que parece un laboratorio abandonado. Hay matraces con líquidos de colores sobre una mesa, un mechero Bunsen apagado y estantes con frascos vacíos.",
        image: "images/room3.jpg",
        objects: {
            'matraces': "Hay tres matraces: uno con líquido ROJO, otro AZUL y otro AMARILLO.",
            'mechero': "Un mechero Bunsen clásico. Necesitaría gas y una chispa.",
            'estantes': "Principalmente vacíos, excepto por un pequeño frasco con la etiqueta 'Agua Destilada'.",
            'mesa': "La superficie de trabajo principal. Hay marcas de quemaduras y manchas.",
            'nota': "La nota arrugada que encontraste. Dice: 'Solo la mezcla precisa revelará el camino. El color del atardecer abre la puerta secreta...'", // Pista: Rojo + Amarillo = Naranja
            'frasco': "Un frasco con 'Agua Destilada'." // Puede ser una distracción o parte de otro puzzle
        },
        exits: {
            'puerta secreta': { target: 'room4', locked: true }
        },
        puzzle: {
            type: 'combination',
            items: ['rojo', 'amarillo'], // Items a combinar
            result: 'naranja', // Resultado deseado
            solvedMessage: "Al mezclar los líquidos rojo y amarillo, obtienes un color naranja brillante. La mezcla burbujea y un panel en la pared se desliza, revelando una nueva salida.",
        }
    },
    room4: {
        name: "Sala 4: El Observatorio Olvidado",
        description: "Subes a una sala circular con una cúpula de cristal rota. Un gran telescopio apunta al cielo nublado. Hay cartas estelares esparcidas y un pedestal vacío en el centro.",
        image: "images/room4.jpg",
        objects: {
            'telescopio': "Un telescopio de latón, grande pero polvoriento. Le falta una lente.",
            'cartas estelares': "Mapas del cielo nocturno. Una carta muestra la constelación de Orión destacada, con sus 7 estrellas principales marcadas.",
            'pedestal': "Un pedestal de piedra con una hendidura circular en la parte superior, como si faltara algo.",
            'cupula': "La cúpula de cristal está rota en varias partes, dejando entrar algo de luz.",
            'orion': "La constelación de Orión, marcada en una carta. Tiene 7 estrellas principales." // Refuerzo de la pista
        },
        exits: {
            'escalera caracol': { target: 'room5', locked: true }
        },
        puzzle: {
            type: 'placement',
            itemNeeded: 'lente', // Necesita la lente encontrada (hipotéticamente) antes
            target: 'pedestal',
            solvedMessage: "Colocas la Lente de Cristal en el pedestal. Un rayo de luz (imaginario, ya que está nublado) se enfoca desde la cúpula, atravesando la lente e iluminando un número grabado en el suelo: '4'. Una escalera de caracol desciende desde una trampilla oculta.",
            reward: '4' // El número es la clave o parte de ella
        }
        // Nota: Para este puzzle, necesitamos añadir la 'lente' al inventario en una sala anterior o como objeto encontrable aquí. Simplificaremos por ahora.
        // Añadamos la lente como objeto encontrable aquí para simplificar.
        // objects: { ... 'lente': 'Una lente de cristal pulido tirada cerca del telescopio.'}
    },
    room5: {
        name: "Sala 5: La Puerta Final",
        description: "La escalera de caracol termina ante una imponente puerta de metal con cinco cerraduras. Junto a ella, hay un panel con ranuras y botones.",
        image: "images/room5.jpg",
        objects: {
            'puerta final': "Una puerta enorme y pesada. Parece ser la salida definitiva.",
            'cerraduras': "Cinco cerraduras distintas. Parecen necesitar llaves o códigos específicos.",
            'panel': "Un panel complejo. Tiene una ranura que parece ajustarse a la 'nota' y botones numéricos.",
            // Necesitamos pistas de las salas anteriores. Asumamos que recogimos:
            // - Código numérico Sala 1: 7319 (no usado directamente, pero tal vez un dígito)
            // - Símbolo/Secuencia Sala 2 (podría dar una letra o número) -> Simplifiquemos, digamos que la nota da una palabra clave "LUZ"
            // - Color Sala 3 (Naranja) -> Podría asociarse a un número? Digamos 5.
            // - Número Sala 4: 4
            // El puzzle final podría ser combinar estos elementos.
        },
        exits: {}, // No hay salidas, solo la victoria
        puzzle: {
            type: 'final_code',
            // Combinación hipotética: Palabra de la nota + Num Sala 4 + Num asociado al color Naranja
            solution: 'LUZ45',
            solvedMessage: "Introduces el código 'LUZ45'. Las cerraduras giran con un fuerte CLANK y la pesada puerta de metal se abre lentamente... ¡Has escapado!",
        }
    }
    // Añadir más salas si es necesario
};

// --- Game Logic Functions ---

function showFeedback(message, type = 'info') {
    feedbackElement.textContent = message;
    feedbackElement.className = `feedback-message feedback-${type}`; // Aplica clase CSS para estilo
    // Opcional: Limpiar feedback después de unos segundos
    setTimeout(() => {
        feedbackElement.textContent = '';
        feedbackElement.className = 'feedback-message';
    }, 5000); // Desaparece después de 5 segundos
}

function updateInventoryDisplay() {
    inventoryListElement.innerHTML = ''; // Limpia la lista actual
    inventory.forEach(item => {
        const li = document.createElement('li');
        // Intenta añadir un icono si existe la imagen
        const img = document.createElement('img');
        img.src = `images/${item}.png`; // Asume que tienes una imagen .png para cada item
        img.alt = item;
        img.onerror = () => img.style.display = 'none'; // Oculta si no hay imagen
        li.appendChild(img);
        li.appendChild(document.createTextNode(item.charAt(0).toUpperCase() + item.slice(1))); // Capitaliza el nombre
        inventoryListElement.appendChild(li);
    });
}

function changeRoom(roomId) {
    if (rooms[roomId]) {
        currentRoom = roomId;
        const room = rooms[currentRoom];
        roomTitleElement.textContent = room.name;
        roomDescriptionElement.textContent = room.description;
        roomImageElement.src = room.image;
        roomImageElement.alt = room.name; // Actualiza el alt text
        showFeedback(`Has entrado en: ${room.name}`);
        userInputElement.value = ''; // Limpia el input
        // Resetear estados específicos de la sala si es necesario (ej: puzzle de secuencia)
        if (room.puzzle?.type === 'sequence') {
            room.pressedSequence = [];
        }
    } else {
        showFeedback("No puedes ir en esa dirección.", 'error');
    }
}

function look(objectName) {
    const room = rooms[currentRoom];
    if (objectName) {
        // Normalizar nombre del objeto (quitar artículos, etc.) - Simplificado por ahora
        const normalizedName = objectName.toLowerCase().replace(/^(el|la|los|las|un|una|unos|unas)\s+/, '');

        if (room.objects && room.objects[normalizedName]) {
            // Lógica especial para objetos que revelan algo
            if (currentRoom === 'room1' && normalizedName === 'cuadro' && !inventory.includes('papelito')) {
                inventory.push('papelito');
                updateInventoryDisplay();
                showFeedback(room.objects[normalizedName] + " Has encontrado un 'papelito'.", 'success');
            } else if (currentRoom === 'room1' && normalizedName === 'libro' && inventory.includes('libro') && !inventory.includes('nota_libro')) {
                 // Podríamos añadir una 'nota_libro' al inventario o simplemente dar la info
                 showFeedback(room.objects[normalizedName] + " Dentro hay una nota con el número '1'.", 'info');
                 // Marcar que la pista del libro se ha visto para evitar repetición si es necesario
            } else {
                showFeedback(room.objects[normalizedName], 'info');
            }
        } else {
            showFeedback(`No ves ningún '${objectName}' aquí.`, 'error');
        }
    } else {
        // Mirar alrededor (descripción de la sala)
        showFeedback(room.description, 'info');
    }
}

function take(objectName) {
    const room = rooms[currentRoom];
    const normalizedName = objectName.toLowerCase().replace(/^(el|la|los|las|un|una|unos|unas)\s+/, '');

    // Items específicos que se pueden coger
    if (currentRoom === 'room1') {
        if (normalizedName === 'libro' && !inventory.includes('libro')) {
            inventory.push('libro');
            updateInventoryDisplay();
            // Opcional: eliminar el libro de los objetos visibles o cambiar su descripción
            // delete room.objects.libro; // o room.objects.estanterias = "..."
            showFeedback("Has cogido el libro con el número 7.", 'success');
            return;
        }
        // El papelito se añade al mirar el cuadro
    } else if (currentRoom === 'room2') {
         if (normalizedName === 'nota' && puzzlesSolved.room2 && !inventory.includes('nota')) {
            inventory.push('nota');
            updateInventoryDisplay();
            showFeedback("Has recogido la nota arrugada.", 'success');
            return;
         }
    } else if (currentRoom === 'room3') {
        // Añadir lógica para coger matraces si fuera necesario
    } else if (currentRoom === 'room4') {
         // Simplificación: Lente directamente cogible
         if (normalizedName === 'lente' && !inventory.includes('lente')) {
             // Asumiendo que añadimos 'lente' a los objetos de room4
             if (room.objects && room.objects.lente) {
                inventory.push('lente');
                updateInventoryDisplay();
                // Opcional: cambiar descripción de donde estaba
                room.objects.lente = "Ya has cogido la lente."; // O eliminarla
                showFeedback("Has recogido la Lente de Cristal.", 'success');
                return;
             }
         }
    }

    showFeedback(`No puedes coger '${objectName}'.`, 'error');
}


function use(objectName, targetName = null) {
    const room = rooms[currentRoom];
    const normObjectName = objectName.toLowerCase().replace(/^(el|la|los|las|un|una|unos|unas)\s+/, '');
    const normTargetName = targetName?.toLowerCase().replace(/^(el|la|los|las|un|una|unos|unas)\s+/, '');

    // --- Puzzle Sala 1: Código Puerta ---
    // Comando: usar [codigo] en puerta / introducir [codigo]
    if (currentRoom === 'room1' && room.exits.puerta.locked) {
        // Permitir "usar CODIGO en puerta" o simplemente "CODIGO" o "introducir CODIGO"
        const potentialCode = normObjectName; // Si el comando es solo el código
        if (potentialCode === room.exits.puerta.code || (normTargetName === 'puerta' && potentialCode === room.exits.puerta.code)) {
            puzzlesSolved.room1 = true;
            room.exits.puerta.locked = false;
            room.objects.puerta = "La puerta de madera maciza está ahora abierta."; // Actualiza descripción
            showFeedback("¡Correcto! El candado hace clic y se abre. La puerta está desbloqueada.", 'success');
            return;
        } else if (potentialCode.match(/^\d{4}$/) || (normTargetName === 'puerta' && potentialCode.match(/^\d{4}$/))) {
             showFeedback("Ese código no funciona.", 'error');
             return;
        }
    }
    // Añadir la pista que falta para el 9
    if (currentRoom === 'room1' && normObjectName === 'tintero' && !inventory.includes('pista_9')) {
         showFeedback("El tintero está seco, pero al moverlo ves un '9' grabado débilmente en el fondo del escritorio.", 'info');
         // Marcar como vista si es necesario inventory.push('pista_9');
         return;
    }


    // --- Puzzle Sala 2: Secuencia Símbolos ---
    // Comando: pulsar [simbolo] / usar [simbolo]
    if (currentRoom === 'room2' && !puzzlesSolved.room2 && room.puzzle?.type === 'sequence') {
        const symbol = normObjectName;
        if (room.puzzle.elements.includes(symbol)) {
            room.pressedSequence.push(symbol);
            showFeedback(`Has pulsado ${symbol}. Secuencia actual: ${room.pressedSequence.join(', ')}`);

            // Comprobar si la secuencia es correcta
            if (room.pressedSequence.length === room.puzzle.elements.length) {
                if (JSON.stringify(room.pressedSequence) === JSON.stringify(room.puzzle.elements)) {
                    puzzlesSolved.room2 = true;
                    room.exits.escaleras.locked = false; // Desbloquea la salida
                    room.description += " Un compartimento secreto se ha abierto en la pared."; // Actualiza desc
                    // Añadir el objeto 'nota' como visible/cogible
                    room.objects.compartimento = "Un pequeño compartimento abierto. Dentro hay una nota arrugada.";
                    showFeedback(room.puzzle.solvedMessage, 'success');
                } else {
                    showFeedback("Secuencia incorrecta. Los símbolos vuelven a su posición inicial.", 'error');
                    room.pressedSequence = []; // Reinicia la secuencia
                }
            }
            return; // Acción manejada
        }
    }

    // --- Puzzle Sala 3: Combinar Líquidos ---
    // Comando: mezclar [color1] con [color2] / usar [color1] en [color2]
     if (currentRoom === 'room3' && !puzzlesSolved.room3 && room.puzzle?.type === 'combination') {
        // Simplificado: Comando "mezclar rojo amarillo" o "usar rojo con amarillo"
        const colors = [normObjectName, normTargetName].filter(c => c).sort(); // Obtener colores y ordenar para comparar
        const requiredColors = [...room.puzzle.items].sort();

        if (room.objects.matraces && colors.length === 2 && JSON.stringify(colors) === JSON.stringify(requiredColors)) {
            puzzlesSolved.room3 = true;
            room.exits['puerta secreta'].locked = false;
            room.description += " Un panel oculto en la pared se ha deslizado."; // Actualiza desc
            showFeedback(room.puzzle.solvedMessage, 'success');
            // Opcional: remover los matraces usados del inventario o de la sala
            return;
        } else if (room.objects.matraces && colors.length === 2) {
            showFeedback("Mezclas los líquidos, pero no pasa nada interesante. Lavas el recipiente.", 'error');
            return;
        }
    }

    // --- Puzzle Sala 4: Colocar Lente ---
    // Comando: usar lente en pedestal / colocar lente
    if (currentRoom === 'room4' && !puzzlesSolved.room4 && room.puzzle?.type === 'placement') {
        if (inventory.includes(room.puzzle.itemNeeded) && (normObjectName === room.puzzle.itemNeeded || (normObjectName === room.puzzle.itemNeeded && normTargetName === room.puzzle.target))) {
             puzzlesSolved.room4 = true;
             room.exits['escalera caracol'].locked = false;
             room.description += " Una trampilla en el suelo se abre, revelando una escalera de caracol descendente."; // Actualiza desc
             showFeedback(room.puzzle.solvedMessage, 'success');
             // Opcional: quitar lente del inventario
             inventory = inventory.filter(item => item !== 'lente');
             updateInventoryDisplay();
             return;
        } else if (normObjectName === 'lente' && !inventory.includes('lente')) {
            showFeedback("No tienes la lente.", 'error');
            return;
        }
    }


    // --- Puzzle Sala 5: Código Final ---
    // Comando: usar [codigo] en panel / introducir [codigo]
    if (currentRoom === 'room5' && !puzzlesSolved.room5 && room.puzzle?.type === 'final_code') {
        const finalCodeAttempt = normObjectName.toUpperCase(); // Código suele ser insensible a mayúsculas

        if (finalCodeAttempt === room.puzzle.solution) {
            puzzlesSolved.room5 = true;
            showFeedback(room.puzzle.solvedMessage, 'success');
            // ¡Fin del juego!
            roomDescriptionElement.textContent = "¡Felicidades! Has logrado escapar.";
            userInputElement.disabled = true; // Deshabilita más acciones
            actionButton.disabled = true;
        } else {
            showFeedback("El panel emite un sonido de error. Ese no es el código correcto.", 'error');
        }
        return; // Acción manejada
    }


    // --- Acciones Generales / Otros Usos ---
    // Ejemplo: Usar llave en cajón
    if (currentRoom === 'room1' && normObjectName === 'llave' && normTargetName === 'cajon') {
        if (inventory.includes('llave')) {
            // Lógica para abrir el cajón (podría contener otra pista o nada)
            room.objects.cajon = "El cajón está abierto. Dentro encuentras solo polvo."; // Actualiza descripción
            showFeedback("Usas la llave pequeña y abres el cajón. Está vacío.", 'info');
            // Opcional: quitar llave del inventario si es de un solo uso
        } else {
            showFeedback("No tienes esa llave.", 'error');
        }
        return; // Acción manejada
    }
    // Añadir la llave pequeña como recompensa de algún puzzle si no está
    // Por ahora, asumimos que la llave no existe o se consigue de otra forma


    // Si ninguna acción específica funcionó
    showFeedback(`No puedes usar '${objectName}' ${targetName ? `en '${targetName}'` : 'así'}.`, 'error');
}


function go(direction) {
    const room = rooms[currentRoom];
    const exit = room.exits[direction.toLowerCase()];

    if (exit) {
        if (!exit.locked) {
            changeRoom(exit.target);
        } else {
            // Mensaje específico si se intenta ir por una puerta cerrada con código
            if (exit.code) {
                 showFeedback(`La ${direction} está cerrada con un candado numérico.`, 'error');
            } else {
                 showFeedback(`La ${direction} está cerrada o bloqueada.`, 'error');
            }
        }
    } else {
        showFeedback("No puedes ir por ahí.", 'error');
    }
}

function processInput() {
    const inputText = userInputElement.value.trim().toLowerCase();
    const parts = inputText.split(' ');
    const command = parts[0];
    const objectName = parts.slice(1).join(' '); // El resto es el objeto/dirección/código

    if (!command) {
        showFeedback("¿Qué quieres hacer?", 'info');
        return;
    }

    // Limpiar feedback anterior al procesar nuevo comando
    feedbackElement.textContent = '';
    feedbackElement.className = 'feedback-message';

    switch (command) {
        case 'mirar':
        case 'observar':
        case 'examinar':
            look(objectName);
            break;
        case 'coger':
        case 'tomar':
        case 'recoger':
            take(objectName);
            break;
        case 'usar':
        case 'utilizar':
        case 'colocar': // Añadido para lente
        case 'mezclar': // Añadido para puzzle colores
            // Detectar "usar X en Y" o "mezclar X con Y"
            const useParts = objectName.split(/ en | con /);
            use(useParts[0], useParts[1]); // Puede que targetName sea undefined si no hay "en/con"
            break;
        case 'ir':
        case 've':
        case 'entrar':
            go(objectName); // objectName aquí es la dirección/salida
            break;
        case 'introducir': // Para códigos
        case 'poner': // Para códigos o colocar objetos
             // Asumir que después de introducir viene el código o el objeto a usar
             use(objectName); // Reutiliza la lógica de 'usar' para códigos o colocación simple
             break;
        case 'pulsar': // Para botones/símbolos
            // Asumir que después de pulsar viene el objeto
             use(objectName); // Reutiliza la lógica de 'usar'
             break;
        case 'inventario':
        case 'bolsillo':
             showFeedback(`Llevas: ${inventory.length > 0 ? inventory.join(', ') : 'nada'}.`, 'info');
             break;
        default:
             // Intenta interpretar como un código si es numérico o una palabra clave potencial
             if (currentRoom === 'room1' && command.match(/^\d{4}$/) && rooms.room1.exits.puerta.locked) {
                 use(command, 'puerta'); // Intenta usar como código en la puerta
             } else if (currentRoom === 'room5' && rooms.room5.puzzle?.type === 'final_code') {
                 use(command); // Intenta usar como código final
             } else {
                 showFeedback(`No entiendo '${inputText}'. Prueba con 'mirar', 'coger', 'usar [objeto] en [objetivo]', 'ir [dirección]', 'introducir [código]'.`, 'error');
             }
    }

    userInputElement.value = ''; // Limpia el input después de procesar
}

// --- Event Listeners ---
actionButton.addEventListener('click', processInput);
userInputElement.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        processInput();
    }
});

// --- Initial Game Setup ---
function startGame() {
    changeRoom(currentRoom); // Muestra la primera sala
    updateInventoryDisplay(); // Muestra inventario inicial (vacío)
}

// Inicia el juego cuando se carga la página
window.onload = startGame;