document.addEventListener('DOMContentLoaded', (event) => {
    const toolbarItems = document.querySelectorAll('.toolbar-item');
    const canvasContainer = document.querySelector('.canvas-container');
    const canvas = document.getElementById('canvas');
    const downloadBtn = document.getElementById('downloadBtn');
  
    const imageUrl = 'img/factory.png'; // Замените на фактический путь к вашему изображению
  
    const img = new Image();
    img.src = imageUrl;
    img.onload = function() {
        let imgWidth = img.width;
        let imgHeight = img.height;
  
        // Ограничиваем максимальный размер изображения
        const maxSize = 1000;
        if (imgWidth > maxSize || imgHeight > maxSize) {
            if (imgWidth > imgHeight) {
                imgHeight = Math.round((imgHeight * maxSize) / imgWidth);
                imgWidth = maxSize;
            } else {
                imgWidth = Math.round((imgWidth * maxSize) / imgHeight);
                imgHeight = maxSize;
            }
        }
  
        canvas.style.width = `${imgWidth}px`;
        canvas.style.height = `${imgHeight}px`;
        canvas.style.backgroundImage = `url(${imageUrl})`;
        canvasContainer.style.width = `${imgWidth}px`;
        canvasContainer.style.height = `${imgHeight}px`;
    };
  
    toolbarItems.forEach(item => {
        item.addEventListener('mousedown', createClone);
    });
  
    function createClone(e) {
        e.preventDefault(); // Отключаем выделение других элементов
        const clone = e.currentTarget.cloneNode(true);
        clone.classList.add('draggable');
        clone.setAttribute('draggable', false);
        clone.style.position = 'absolute';
        clone.style.left = `${e.clientX - e.currentTarget.offsetWidth / 2}px`;
        clone.style.top = `${e.clientY - e.currentTarget.offsetHeight / 2}px`;
  
        document.body.appendChild(clone);
  
        function onMouseMove(event) {
            clone.style.left = `${event.clientX - clone.offsetWidth / 2}px`;
            clone.style.top = `${event.clientY - clone.offsetHeight / 2}px`;
        }
  
        document.addEventListener('mousemove', onMouseMove);
  
        clone.onmouseup = function(event) {
            document.removeEventListener('mousemove', onMouseMove);
            clone.onmouseup = null;
  
            if (event.clientX > canvas.getBoundingClientRect().left &&
                event.clientX < canvas.getBoundingClientRect().right &&
                event.clientY > canvas.getBoundingClientRect().top &&
                event.clientY < canvas.getBoundingClientRect().bottom) {
                clone.style.left = `${event.clientX - canvas.getBoundingClientRect().left - clone.offsetWidth / 2}px`;
                clone.style.top = `${event.clientY - canvas.getBoundingClientRect().top - clone.offsetHeight / 2}px`;
                canvas.appendChild(clone);
  
                // Добавляем событие для перетаскивания внутри canvas
                enableDragging(clone);
            } else {
                clone.remove();
            }
        };
  
        // Устанавливаем начальную позицию сразу
        onMouseMove(e);
    }
  
    function enableDragging(element) {
        element.onmousedown = function(e) {
            e.preventDefault();
  
            let shiftX = e.clientX - element.getBoundingClientRect().left;
            let shiftY = e.clientY - element.getBoundingClientRect().top;
  
            function moveAt(pageX, pageY) {
                let newLeft = pageX - canvas.getBoundingClientRect().left - shiftX;
                let newTop = pageY - canvas.getBoundingClientRect().top - shiftY;
  
                element.style.left = `${newLeft}px`;
                element.style.top = `${newTop}px`;
            }
  
            function onMouseMove(event) {
                moveAt(event.pageX, event.pageY);
            }
  
            document.addEventListener('mousemove', onMouseMove);
  
            element.onmouseup = function() {
                document.removeEventListener('mousemove', onMouseMove);
                element.onmouseup = null;
  
                // Проверка после завершения перемещения
                let newLeft = parseInt(element.style.left);
                let newTop = parseInt(element.style.top);
                if (newLeft < 0 || newTop < 0 || newLeft + element.offsetWidth > canvas.offsetWidth || newTop + element.offsetHeight > canvas.offsetHeight) {
                    element.remove();
                }
            };
        };
  
        element.ondragstart = function() {
            return false;
        };
    }
  
    downloadBtn.addEventListener('click', () => {
        html2canvas(canvas).then((canvas) => {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });
  
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save('canvas.pdf');
        });
    });
  });
  