// Recherche Page Script
let currentIndex = 0;

function initRecherche() {
    const carousel = document.getElementById('carousel');
    const carouselIndicators = document.getElementById('carousel-indicators');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    const swotButton = document.getElementById('swot-button');
    const swotSection = document.getElementById('swot-section');
    
    if (!carousel || !carouselIndicators) {
        console.error('Carousel-Elemente nicht gefunden');
        return;
    }
    
    // Render carousel cards
    function renderCarousel() {
        if (!carousel) {
            console.error('Carousel-Element nicht gefunden');
            return;
        }
        
        if (typeof rechercheData === 'undefined') {
            console.error('rechercheData ist nicht definiert');
            carousel.innerHTML = '<div class="carousel-card"><p>Daten werden geladen...</p></div>';
            return;
        }
        
        if (!rechercheData || !rechercheData.cards || !Array.isArray(rechercheData.cards)) {
            console.error('rechercheData.cards ist nicht verfügbar oder kein Array');
            carousel.innerHTML = '<div class="carousel-card"><p>Keine Daten verfügbar</p></div>';
            return;
        }
        
        console.log('Rendering carousel mit', rechercheData.cards.length, 'Karten');
        console.log('Erste Karte:', rechercheData.cards[0]);
        
        const cardsHtml = rechercheData.cards.map((card, index) => {
            // Filter empty items first
            const filteredItems = card.items.filter(item => item.trim() !== '');
            
            // No accordion for Security or Collaboration cards
            let isAccordionCard = false;
            let accordionId = null;
            
            // Find server list section (starts with "Rund 26 Server, darunter:")
            let serverListStartIndex = -1;
            let serverListEndIndex = -1;
            
            filteredItems.forEach((item, idx) => {
                const trimmedItem = item.trim();
                if (trimmedItem.includes('Rund 26 Server, darunter:')) {
                    serverListStartIndex = idx;
                }
            });
            
            // If we found a server list, mark the end after the arrow item
            if (serverListStartIndex >= 0) {
                for (let i = serverListStartIndex + 1; i < filteredItems.length; i++) {
                    const trimmedItem = filteredItems[i].trim();
                    // Include all items that start with "–" or "→" after the header
                    if (trimmedItem.startsWith('→')) {
                        serverListEndIndex = i + 1;
                        break;
                    }
                    // If we hit a non-server item (doesn't start with – or →), stop
                    if (!trimmedItem.startsWith('–') && !trimmedItem.startsWith('→')) {
                        serverListEndIndex = i;
                        break;
                    }
                }
                // If no end found, include all remaining items
                if (serverListEndIndex === -1) {
                    serverListEndIndex = filteredItems.length;
                }
            }
            
            // Find Web-Security section for Security card (id 3)
            let webSecurityStartIndex = -1;
            if (card.id === 3) {
                filteredItems.forEach((item, idx) => {
                    if (item.trim() === 'Web-Security:') {
                        webSecurityStartIndex = idx;
                    }
                });
            }
            
            // Find mdm.scnat.ch section for Collaboration card (id 4)
            let mdmStartIndex = -1;
            if (card.id === 4) {
                filteredItems.forEach((item, idx) => {
                    if (item.trim() === 'mdm.scnat.ch:') {
                        mdmStartIndex = idx;
                    }
                });
            }
            
            // Build HTML
            const items = filteredItems.map((item, idx) => {
                    const trimmedItem = item.trim();
                    const isServerListHeader = trimmedItem.includes('Rund 26 Server, darunter:');
                    const isInServerList = serverListStartIndex >= 0 && idx > serverListStartIndex && idx < serverListEndIndex;
                    const isWebSecurityHeader = trimmedItem === 'Web-Security:';
                    const isInWebSecurity = webSecurityStartIndex >= 0 && idx > webSecurityStartIndex;
                    const isMdmHeader = trimmedItem === 'mdm.scnat.ch:';
                    const isInMdm = mdmStartIndex >= 0 && idx > mdmStartIndex;
                    
                    // Server list header with accordion
                    if (isServerListHeader) {
                        return `<li class="item-heading accordion-header" data-accordion="server-list">
                            <span>${item}</span>
                            <svg class="accordion-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M6 9l6 6 6-6"/>
                            </svg>
                        </li>`;
                    }
                    
                    // Server list items (hidden by default)
                    if (isInServerList) {
                        const itemHtml = formatServerListItem(trimmedItem);
                        return `<li class="accordion-item" data-accordion="server-list">${itemHtml}</li>`;
                    }
                    
                    // Web-Security header with accordion
                    if (isWebSecurityHeader) {
                        return `<li class="item-heading accordion-header" data-accordion="web-security">
                            <span>${item}</span>
                            <svg class="accordion-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M6 9l6 6 6-6"/>
                            </svg>
                        </li>`;
                    }
                    
                    // Web-Security items (hidden by default)
                    if (isInWebSecurity) {
                        const itemContent = formatRegularItemContent(trimmedItem, item);
                        return `<li class="accordion-item" data-accordion="web-security">${itemContent}</li>`;
                    }
                    
                    // mdm.scnat.ch header with accordion
                    if (isMdmHeader) {
                        return `<li class="item-heading accordion-header" data-accordion="mdm">
                            <span>${item}</span>
                            <svg class="accordion-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M6 9l6 6 6-6"/>
                            </svg>
                        </li>`;
                    }
                    
                    // mdm.scnat.ch items (hidden by default)
                    if (isInMdm) {
                        return formatCollaborationItem(trimmedItem, item, true);
                    }
                    
                    // Collaboration card (id 4) - items with arrows (no dashes), but mdm is accordion
                    if (card.id === 4) {
                        return formatCollaborationItem(trimmedItem, item, false);
                    }
                    
                    // Regular items (including Mail-Security items)
                    return formatRegularItem(trimmedItem, item);
                });
            
            itemsHtml = items.join('');
            
            function formatServerListItem(trimmedItem) {
                // Check if item starts with "→" - only this one gets arrow styling, remove CSS arrow
                if (trimmedItem.startsWith('→')) {
                    return `<span class="server-item-arrow server-item-no-arrow">${trimmedItem}</span>`;
                }
                // Check if item starts with "–" and contains ", " for inline items - remove dash
                if (trimmedItem.startsWith('–') && trimmedItem.includes(', ')) {
                    const withoutDash = trimmedItem.substring(1).trim();
                    const parts = withoutDash.split(', ');
                    return `<span class="server-item-inline server-item-no-arrow">${parts.map((part, index) => {
                        if (index === 0) {
                            return `<span>${part.trim()}</span>`;
                        } else {
                            return `<span>, ${part.trim()}</span>`;
                        }
                    }).join('')}</span>`;
                }
                // Regular server item with "–" - remove dash, no arrow
                if (trimmedItem.startsWith('–')) {
                    const withoutDash = trimmedItem.substring(1).trim();
                    return `<span class="server-item-dash server-item-no-arrow">${withoutDash}</span>`;
                }
                return `<span class="server-item-no-arrow">${trimmedItem}</span>`;
            }
            
            function formatRegularItemContent(trimmedItem, originalItem) {
                // Check if item ends with ":" for heading style
                if (trimmedItem.endsWith(':')) {
                    return `<span class="item-heading">${originalItem}</span>`;
                }
                // Check if item starts with "–" and contains ", " for inline items
                if (trimmedItem.startsWith('–') && trimmedItem.includes(', ')) {
                    const parts = trimmedItem.split(', ');
                    return `<span class="inline-item">${parts.map((part, index) => {
                        if (index === 0) {
                            return `<span>${part.trim()}</span>`;
                        } else {
                            return `<span>, ${part.trim()}</span>`;
                        }
                    }).join('')}</span>`;
                }
                // Check if item starts with "→" for arrow formatting
                if (trimmedItem.startsWith('→')) {
                    return `<span class="arrow-item">${originalItem}</span>`;
                }
                // Check if item starts with "–" for nested formatting
                if (trimmedItem.startsWith('–')) {
                    return `<span class="nested-item">${originalItem}</span>`;
                }
                // Default: regular item
                return `<span>${originalItem}</span>`;
            }
            
            function formatRegularItem(trimmedItem, originalItem) {
                // Check if item ends with ":" for heading style
                if (trimmedItem.endsWith(':')) {
                    return `<li class="item-heading">${originalItem}</li>`;
                }
                // Check if item starts with "–" and contains ", " for inline items
                if (trimmedItem.startsWith('–') && trimmedItem.includes(', ')) {
                    const parts = trimmedItem.split(', ');
                    return `<li class="inline-item">${parts.map((part, index) => {
                        if (index === 0) {
                            return `<span>${part.trim()}</span>`;
                        } else {
                            return `<span>, ${part.trim()}</span>`; // Comma with space after
                        }
                    }).join('')}</li>`;
                }
                // Check if item starts with "→" for arrow formatting
                if (trimmedItem.startsWith('→')) {
                    return `<li class="arrow-item">${originalItem}</li>`;
                }
                // Check if item starts with "–" for nested formatting
                if (trimmedItem.startsWith('–')) {
                    return `<li class="nested-item">${originalItem}</li>`;
                }
                // Default: regular item with CSS arrow
                return `<li>${originalItem}</li>`;
            }
            
            function formatCollaborationItem(trimmedItem, originalItem, isAccordionItem = false) {
                // Check if item ends with ":" for heading style (but not mdm.scnat.ch: which is handled separately)
                if (trimmedItem.endsWith(':') && trimmedItem !== 'mdm.scnat.ch:') {
                    return `<li class="item-heading">${originalItem}</li>`;
                }
                // Remove "–" from items and show with arrow
                if (trimmedItem.startsWith('–')) {
                    const withoutDash = trimmedItem.substring(1).trim();
                    // Check if contains ", " for inline items
                    if (withoutDash.includes(', ')) {
                        const parts = withoutDash.split(', ');
                        const content = parts.map((part, index) => {
                            if (index === 0) {
                                return `<span>${part.trim()}</span>`;
                            } else {
                                return `<span>, ${part.trim()}</span>`;
                            }
                        }).join('');
                        if (isAccordionItem) {
                            return `<li class="accordion-item" data-accordion="mdm"><span class="inline-item">${content}</span></li>`;
                        }
                        return `<li class="inline-item">${content}</li>`;
                    }
                    // Regular item without dash, with arrow
                    if (isAccordionItem) {
                        return `<li class="accordion-item" data-accordion="mdm"><span>${withoutDash}</span></li>`;
                    }
                    return `<li>${withoutDash}</li>`;
                }
                // Regular item with arrow
                if (isAccordionItem) {
                    return `<li class="accordion-item" data-accordion="mdm"><span>${originalItem}</span></li>`;
                }
                return `<li>${originalItem}</li>`;
            }
            
            const subtitleHtml = card.subtitle 
                ? `<p class="card-subtitle">${card.subtitle}</p>`
                : '';
            
            // Regular title (no accordion)
            const titleHtml = `<h3>${card.title}</h3>`;
            
            return `
                <div class="carousel-card ${index === 0 ? 'active' : ''}" data-index="${index}">
                    <div class="carousel-card-content">
                        ${titleHtml}
                        ${subtitleHtml}
                        <ul>
                            ${itemsHtml}
                        </ul>
                    </div>
                    <button class="carousel-card-expand-btn" aria-label="Inhalt erweitern">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M6 9l6 6 6-6"/>
                        </svg>
                    </button>
                </div>
            `;
        }).join('');
        
        console.log('Cards HTML generiert, Länge:', cardsHtml.length);
        carousel.innerHTML = cardsHtml;
        console.log('Carousel innerHTML gesetzt');
        
        // Create indicators
        const indicatorsHtml = rechercheData.cards.map((_, index) => 
            `<button class="carousel-indicator ${index === 0 ? 'active' : ''}" data-index="${index}" aria-label="Karte ${index + 1}"></button>`
        ).join('');
        
        carouselIndicators.innerHTML = indicatorsHtml;
        
        // Add indicator click handlers
        document.querySelectorAll('.carousel-indicator').forEach(indicator => {
            indicator.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                goToSlide(index);
            });
        });

        // Add expand/collapse button handlers for mobile
        document.querySelectorAll('.carousel-card-expand-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const card = this.closest('.carousel-card');
                if (card) {
                    card.classList.toggle('expanded');
                    const isExpanded = card.classList.contains('expanded');
                    this.setAttribute('aria-label', isExpanded ? 'Inhalt einklappen' : 'Inhalt erweitern');
                }
            });
        });
        
        // Add accordion handlers for server list and card titles
        document.querySelectorAll('.accordion-header').forEach(header => {
            header.addEventListener('click', function() {
                const accordionId = this.getAttribute('data-accordion');
                const card = this.closest('.carousel-card');
                const isExpanded = card.classList.contains(`accordion-${accordionId}-expanded`);
                
                card.classList.toggle(`accordion-${accordionId}-expanded`);
                const icon = this.querySelector('.accordion-icon');
                if (icon) {
                    icon.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
                }
            });
        });
    }
    
    // Go to specific slide
    function goToSlide(index) {
        currentIndex = index;
        const cards = document.querySelectorAll('.carousel-card');
        const indicators = document.querySelectorAll('.carousel-indicator');
        
        cards.forEach((card, i) => {
            const isActive = i === index;
            card.classList.toggle('active', isActive);
            // Collapse all cards when switching (mobile behavior)
            if (!isActive) {
                card.classList.remove('expanded');
            }
        });
        
        indicators.forEach((indicator, i) => {
            indicator.classList.toggle('active', i === index);
        });
        
        // Scroll carousel
        if (carousel) {
            carousel.scrollTo({
                left: index * carousel.offsetWidth,
                behavior: 'smooth'
            });
        }
        
        // Update button states
        updateButtonStates();
    }
    
    // Update button states
    function updateButtonStates() {
        if (!rechercheData || !rechercheData.cards) return;
        
        if (prevBtn) {
            prevBtn.disabled = currentIndex === 0;
        }
        if (nextBtn) {
            nextBtn.disabled = currentIndex === rechercheData.cards.length - 1;
        }
    }
    
    // Previous button
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            if (currentIndex > 0) {
                goToSlide(currentIndex - 1);
            }
        });
    }
    
    // Next button
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            if (currentIndex < rechercheData.cards.length - 1) {
                goToSlide(currentIndex + 1);
            }
        });
    }
    
    // Touch/swipe support
    let startX = 0;
    let scrollLeft = 0;
    
    if (carousel) {
        carousel.addEventListener('touchstart', function(e) {
            startX = e.touches[0].pageX - carousel.offsetLeft;
            scrollLeft = carousel.scrollLeft;
        });
        
        carousel.addEventListener('touchmove', function(e) {
            e.preventDefault();
            const x = e.touches[0].pageX - carousel.offsetLeft;
            const walk = (x - startX) * 2;
            carousel.scrollLeft = scrollLeft - walk;
        });
        
        carousel.addEventListener('touchend', function() {
            // Snap to nearest card
            const cardWidth = carousel.offsetWidth;
            const newIndex = Math.round(carousel.scrollLeft / cardWidth);
            goToSlide(newIndex);
        });
    }
    
    // Render SWOT section
    function renderSWOT() {
        const strengthsList = document.getElementById('swot-strengths');
        const weaknessesList = document.getElementById('swot-weaknesses');
        const opportunitiesList = document.getElementById('swot-opportunities');
        const threatsList = document.getElementById('swot-threats');
        
        if (!strengthsList || !weaknessesList || !opportunitiesList || !threatsList) {
            console.error('SWOT-Elemente nicht gefunden');
            return;
        }
        
        if (typeof rechercheData === 'undefined') {
            console.error('rechercheData ist nicht definiert');
            return;
        }
        
        if (!rechercheData || !rechercheData.swot) {
            console.error('rechercheData.swot ist nicht verfügbar');
            return;
        }
        
        console.log('Rendering SWOT mit Daten:', rechercheData.swot);
        
        if (strengthsList) {
            strengthsList.innerHTML = rechercheData.swot.strengths.map(item => 
                `<li>${item}</li>`
            ).join('');
        }
        
        if (weaknessesList) {
            weaknessesList.innerHTML = rechercheData.swot.weaknesses.map(item => 
                `<li>${item}</li>`
            ).join('');
        }
        
        if (opportunitiesList) {
            opportunitiesList.innerHTML = rechercheData.swot.opportunities.map(item => 
                `<li>${item}</li>`
            ).join('');
        }
        
        if (threatsList) {
            threatsList.innerHTML = rechercheData.swot.threats.map(item => 
                `<li>${item}</li>`
            ).join('');
        }
    }
    
    // SWOT button toggle
    if (swotButton) {
        swotButton.addEventListener('click', function() {
            const isActive = swotSection.classList.contains('active');
            swotSection.classList.toggle('active');
            
            if (!isActive && swotSection.classList.contains('active')) {
                // Wait a moment for the section to become visible
                setTimeout(() => {
                    const isMobile = window.innerWidth <= 768;
                    
                    // Get the first SWOT quadrant(s) to scroll to their titles
                    const firstQuadrant = document.querySelector('.swot-strengths');
                    const secondQuadrant = document.querySelector('.swot-weaknesses');
                    
                    if (firstQuadrant) {
                        const firstQuadrantRect = firstQuadrant.getBoundingClientRect();
                        const currentScrollY = window.scrollY || window.pageYOffset;
                        
                        // Calculate offset to show titles nicely
                        // On mobile: show first box title with some padding
                        // On desktop: show both top boxes (Strengths and Weaknesses) titles
                        const navHeight = document.querySelector('.sticky-nav')?.offsetHeight || 0;
                        const titleHeight = document.querySelector('.main-title')?.offsetHeight || 0;
                        const offset = navHeight + titleHeight + (isMobile ? 20 : 40); // Extra padding
                        
                        // Scroll to first quadrant title position
                        const targetScrollY = currentScrollY + firstQuadrantRect.top - offset;
                        
                        window.scrollTo({
                            top: Math.max(0, targetScrollY),
                            behavior: 'smooth'
                        });
                    } else {
                        // Fallback: scroll to section with offset
                        const swotSectionRect = swotSection.getBoundingClientRect();
                        const currentScrollY = window.scrollY || window.pageYOffset;
                        const navHeight = document.querySelector('.sticky-nav')?.offsetHeight || 0;
                        const titleHeight = document.querySelector('.main-title')?.offsetHeight || 0;
                        const offset = navHeight + titleHeight + (isMobile ? 20 : 40);
                        const targetScrollY = currentScrollY + swotSectionRect.top - offset;
                        
                        window.scrollTo({
                            top: Math.max(0, targetScrollY),
                            behavior: 'smooth'
                        });
                    }
                }, 100); // Slightly longer delay to ensure section is rendered
            }
        });
    }
    
    // Render function that will be called when data is ready
    function doRender() {
        if (typeof rechercheData === 'undefined' || !rechercheData) {
            console.log('Warte auf rechercheData...');
            return false;
        }
        
        try {
            console.log('Starte Rendering...', rechercheData);
            renderCarousel();
            renderSWOT();
            updateButtonStates();
            console.log('Recherche erfolgreich gerendert');
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
            // Show error message in UI
            if (carousel) {
                carousel.innerHTML = '<div class="carousel-card"><p style="color: red;">Fehler beim Laden der Daten. Bitte Seite neu laden.</p></div>';
            }
        }
    }
    
    // Start trying to render
    tryRender();
    
    // Burger menu (same as main page)
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
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRecherche);
} else {
    // DOM already loaded
    initRecherche();
}

