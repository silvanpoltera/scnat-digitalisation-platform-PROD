// Process Page Script
let currentRotation = 0;
let isRotating = false;
let boxes = [];
let container = null;

function initProcess() {
    const processCircleWrapper = document.querySelector('.process-circle-wrapper');
    const processCircle = document.getElementById('process-circle');
    const processCenter = document.getElementById('process-center');
    
    if (!processCircle || !processCenter || !processCircleWrapper) {
        console.error('Process-Elemente nicht gefunden');
        return;
    }
    
    container = processCircleWrapper;
    
    // Ellipsen-Parameter
    let radiusX = 400; // Horizontaler Radius (kleiner = näher zusammen)
    let radiusY = 120; // Vertikaler Radius (kleiner = näher zusammen)
    let centerX = 0;
    let centerY = 0;
    
    // Update container dimensions
    function updateContainerDimensions() {
        if (!container) return;
        centerX = container.offsetWidth / 2;
        centerY = container.offsetHeight / 2;
        
        // Responsive radii (näher zusammen)
        if (window.innerWidth <= 768) {
            radiusX = container.offsetWidth * 0.5;
            radiusY = container.offsetHeight * 0.2;
        } else {
            radiusX = Math.min(400, container.offsetWidth * 0.35);
            radiusY = Math.min(120, container.offsetHeight * 0.25);
        }
    }
    
    // Render process items in ellipse
    function renderProcessCircle() {
        if (!processCircle) {
            console.error('Process-Circle-Element nicht gefunden');
            return;
        }
        
        if (typeof processData === 'undefined') {
            console.error('processData ist nicht definiert');
            return;
        }
        
        if (!processData || !processData.items || !Array.isArray(processData.items)) {
            console.error('processData.items ist nicht verfügbar oder kein Array');
            return;
        }
        
        const items = processData.items;
        const totalItems = items.length;
        
        updateContainerDimensions();
        
        const itemsHtml = items.map((item, index) => {
            return `
                <div class="process-item ${index === 0 ? 'active' : ''}" 
                     data-index="${index}">
                    <div class="process-item-title">${item.title}</div>
                </div>
            `;
        }).join('');
        
        processCircle.innerHTML = itemsHtml;
        
        // Get all boxes
        boxes = Array.from(document.querySelectorAll('.process-item'));
        
        // Update positions
        updateBoxPositions();
        
        // Update center content
        updateCenterContent(0);
        
        // Add click handlers
        boxes.forEach((box, index) => {
            box.addEventListener('click', function() {
                if (!isRotating) {
                    rotateToIndex(index);
                }
            });
        });
        
        // Update on resize
        window.addEventListener('resize', function() {
            updateContainerDimensions();
            updateBoxPositions();
        });
    }
    
    // Position der Boxen berechnen
    function updateBoxPositions() {
        if (!container || boxes.length === 0) return;
        
        updateContainerDimensions();
        
        const totalItems = boxes.length;
        const boxPositions = [];
        
        boxes.forEach((box, index) => {
            // Angle calculation: Start at top (-90 degrees = 270 degrees)
            // Add offset so first item starts at top
            const baseAngle = (index * 360 / totalItems) - 90; // -90 = top
            const angle = (currentRotation + baseAngle) * Math.PI / 180;
            
            const x = centerX + radiusX * Math.cos(angle) - box.offsetWidth / 2;
            const y = centerY + radiusY * Math.sin(angle) - box.offsetHeight / 2;
            
            // Store position for arrows (center and edge positions)
            const centerBoxX = centerX + radiusX * Math.cos(angle);
            const centerBoxY = centerY + radiusY * Math.sin(angle);
            
            // Calculate edge position (where arrow should start/end)
            const boxHalfWidth = box.offsetWidth / 2;
            const boxHalfHeight = box.offsetHeight / 2;
            
            // Direction to next box
            const nextIndex = (index + 1) % totalItems;
            const nextBaseAngle = (nextIndex * 360 / totalItems) - 90;
            const nextAngle = (currentRotation + nextBaseAngle) * Math.PI / 180;
            const nextCenterX = centerX + radiusX * Math.cos(nextAngle);
            const nextCenterY = centerY + radiusY * Math.sin(nextAngle);
            
            // Vector from current to next box
            const dx = nextCenterX - centerBoxX;
            const dy = nextCenterY - centerBoxY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const unitX = dx / distance;
            const unitY = dy / distance;
            
            // Edge position (on the edge of the box in direction of next box)
            const edgeX = centerBoxX + unitX * boxHalfWidth;
            const edgeY = centerBoxY + unitY * boxHalfHeight;
            
            boxPositions.push({ 
                x: centerBoxX, 
                y: centerBoxY,
                edgeX: edgeX,
                edgeY: edgeY,
                nextEdgeX: nextCenterX - unitX * boxHalfWidth,
                nextEdgeY: nextCenterY - unitY * boxHalfHeight
            });
            
            // Tiefeneffekt (Boxen im Hintergrund kleiner)
            // Top position (sin = -1) should be largest, bottom (sin = 1) smallest
            const scale = 0.7 + 0.3 * (-Math.sin(angle) + 1) / 2;
            const zIndex = Math.round(scale * 100);
            
            box.style.left = x + 'px';
            box.style.top = y + 'px';
            box.style.transform = `scale(${scale})`;
            box.style.zIndex = zIndex;
            box.style.opacity = 0.5 + 0.5 * scale;
            
            // Update active state (top position is at -90 degrees / 270 degrees)
            const angleDeg = (currentRotation + baseAngle) % 360;
            const normalizedAngle = ((angleDeg % 360) + 360) % 360;
            // Check if box is at top (around 270 degrees, with tolerance)
            const isActive = normalizedAngle > 255 && normalizedAngle < 285;
            
            box.classList.toggle('active', isActive);
            
            if (isActive) {
                updateCenterContent(index);
            }
        });
        
        // Arrows removed - no arrows between boxes
    }
    
    // Update arrows between boxes (from box edge to next box edge)
    function updateArrows(boxPositions) {
        const arrowsSvg = document.getElementById('process-arrows');
        if (!arrowsSvg || boxPositions.length < 2) return;
        
        // Clear existing arrows
        arrowsSvg.innerHTML = '';
        
        // Draw arrows between consecutive boxes
        for (let i = 0; i < boxPositions.length; i++) {
            const current = boxPositions[i];
            const next = boxPositions[(i + 1) % boxPositions.length];
            
            // Use edge positions (from box edge to next box edge)
            const startX = current.edgeX;
            const startY = current.edgeY;
            const endX = next.nextEdgeX || next.edgeX;
            const endY = next.nextEdgeY || next.edgeY;
            
            // Calculate angle for arrow
            const dx = endX - startX;
            const dy = endY - startY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 1) continue; // Skip if boxes are too close
            
            const angle = Math.atan2(dy, dx);
            
            // Arrow head size
            const arrowLength = 18;
            const arrowWidth = 12;
            
            // Arrow head points (at the end position)
            const arrowHeadX = endX - arrowLength * Math.cos(angle);
            const arrowHeadY = endY - arrowLength * Math.sin(angle);
            const arrowLeftX = endX - arrowLength * Math.cos(angle) - arrowWidth * Math.cos(angle + Math.PI / 2);
            const arrowLeftY = endY - arrowLength * Math.sin(angle) - arrowWidth * Math.sin(angle + Math.PI / 2);
            const arrowRightX = endX - arrowLength * Math.cos(angle) - arrowWidth * Math.cos(angle - Math.PI / 2);
            const arrowRightY = endY - arrowLength * Math.sin(angle) - arrowWidth * Math.sin(angle - Math.PI / 2);
            
            // Create line for arrow shaft (from start to arrow head)
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', startX);
            line.setAttribute('y1', startY);
            line.setAttribute('x2', arrowHeadX);
            line.setAttribute('y2', arrowHeadY);
            line.setAttribute('stroke', 'rgba(234, 81, 90, 0.7)');
            line.setAttribute('stroke-width', '3');
            line.setAttribute('stroke-linecap', 'round');
            arrowsSvg.appendChild(line);
            
            // Create arrowhead as polygon (pointing to end position)
            const arrowhead = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            const points = `${endX},${endY} ${arrowLeftX},${arrowLeftY} ${arrowRightX},${arrowRightY}`;
            arrowhead.setAttribute('points', points);
            arrowhead.setAttribute('fill', 'rgba(234, 81, 90, 0.9)');
            arrowhead.setAttribute('stroke', 'rgba(234, 81, 90, 0.9)');
            arrowhead.setAttribute('stroke-width', '1');
            arrowsSvg.appendChild(arrowhead);
        }
    }
    
    // Rotate ellipse to show specific item at top (simple rotation from box to box)
    function rotateToIndex(targetIndex) {
        if (isRotating) return;
        
        isRotating = true;
        
        const totalItems = boxes.length;
        const angleStep = 360 / totalItems;
        
        // Calculate target rotation to bring item to top (-90 degrees)
        const targetRotation = -targetIndex * angleStep;
        
        // Calculate rotation difference
        let rotationDiff = targetRotation - currentRotation;
        
        // Normalize to shortest path (-180 to 180)
        rotationDiff = ((rotationDiff % 360) + 360) % 360;
        if (rotationDiff > 180) rotationDiff -= 360;
        
        // Simple linear rotation
        const startRotation = currentRotation;
        const endRotation = currentRotation + rotationDiff;
        const duration = 500; // ms
        const startTime = performance.now();
        
        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Simple linear interpolation - no easing
            currentRotation = startRotation + rotationDiff * progress;
            updateBoxPositions();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                currentRotation = endRotation;
                updateBoxPositions();
                isRotating = false;
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    // Update center content
    function updateCenterContent(index) {
        if (!processCenter || !processData || !processData.items) return;
        
        const item = processData.items[index];
        if (item) {
            processCenter.innerHTML = `<h2>${item.title}</h2>`;
        }
    }
    
    // Get current active index based on rotation (top position)
    function getCurrentIndex() {
        const totalItems = boxes.length;
        const angleStep = 360 / totalItems;
        // Top position is at -90 degrees
        // Find which item is closest to top
        const normalizedRotation = ((currentRotation % 360) + 360) % 360;
        // Adjust for -90 offset
        const adjustedRotation = (normalizedRotation + 90) % 360;
        const index = Math.round((adjustedRotation / 360) * totalItems) % totalItems;
        return index >= 0 ? index : index + totalItems;
    }
    
    // Navigation only via click on boxes or swipe - no buttons
    
    // Touch/swipe support for mobile
    let startX = 0;
    let startY = 0;
    let isDragging = false;
    
    if (processCircleWrapper) {
        processCircleWrapper.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isDragging = true;
        });
        
        processCircleWrapper.addEventListener('touchmove', function(e) {
            if (!isDragging) return;
            e.preventDefault();
        });
        
        processCircleWrapper.addEventListener('touchend', function(e) {
            if (!isDragging) return;
            isDragging = false;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const diffX = startX - endX;
            const diffY = startY - endY;
            
            // Determine swipe direction
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                const currentIndex = getCurrentIndex();
                const totalItems = boxes.length;
                
                if (diffX > 0) {
                    // Swipe left - next
                    const newIndex = (currentIndex + 1) % totalItems;
                    rotateToIndex(newIndex);
                } else {
                    // Swipe right - previous
                    const newIndex = (currentIndex - 1 + totalItems) % totalItems;
                    rotateToIndex(newIndex);
                }
            }
        });
        
        // Mouse drag support for desktop
        let mouseStartX = 0;
        let mouseIsDragging = false;
        
        processCircleWrapper.addEventListener('mousedown', function(e) {
            mouseStartX = e.clientX;
            mouseIsDragging = true;
        });
        
        document.addEventListener('mousemove', function(e) {
            if (!mouseIsDragging) return;
            e.preventDefault();
        });
        
        document.addEventListener('mouseup', function(e) {
            if (!mouseIsDragging) return;
            mouseIsDragging = false;
            
            const mouseEndX = e.clientX;
            const diffX = mouseStartX - mouseEndX;
            
            if (Math.abs(diffX) > 50) {
                const currentIndex = getCurrentIndex();
                const totalItems = boxes.length;
                
                if (diffX > 0) {
                    const newIndex = (currentIndex + 1) % totalItems;
                    rotateToIndex(newIndex);
                } else {
                    const newIndex = (currentIndex - 1 + totalItems) % totalItems;
                    rotateToIndex(newIndex);
                }
            }
        });
    }
    
    // Burger menu (same as other pages)
    const burgerMenu = document.getElementById('burger-menu');
    const navLinksContainer = document.querySelector('.nav-links');
    
    if (burgerMenu && navLinksContainer) {
        burgerMenu.addEventListener('click', function() {
            burgerMenu.classList.toggle('active');
            navLinksContainer.classList.toggle('active');
        });
        
        // Close menu when clicking on a nav link (mobile)
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    burgerMenu.classList.remove('active');
                    navLinksContainer.classList.remove('active');
                }
            });
        });
    }
    
    // Render function that will be called when data is ready
    function doRender() {
        if (typeof processData === 'undefined' || !processData) {
            console.log('Warte auf processData...');
            return false;
        }
        
        try {
            console.log('Starte Rendering...', processData);
            renderProcessCircle();
            updateButtonStates();
            console.log('Process erfolgreich gerendert');
            return true;
        } catch (error) {
            console.error('Fehler beim Rendern:', error);
            return false;
        }
    }
    
    // Try to render - with multiple attempts
    let renderAttempts = 0;
    const maxAttempts = 20;
    
    function tryRender() {
        renderAttempts++;
        if (doRender()) {
            console.log('Rendering erfolgreich nach', renderAttempts, 'Versuchen');
        } else if (renderAttempts < maxAttempts) {
            setTimeout(tryRender, 100);
        } else {
            console.error('Rendering fehlgeschlagen nach', maxAttempts, 'Versuchen');
        }
    }
    
    // Start trying to render
    tryRender();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProcess);
} else {
    // DOM already loaded
    initProcess();
}

