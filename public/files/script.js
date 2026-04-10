// Navigation and Content Synchronization
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSection = document.getElementById('content-section');
    const cubeInputs = document.querySelectorAll('input[name="tabs"]');
    const burgerMenu = document.getElementById('burger-menu');
    const navLinksContainer = document.querySelector('.nav-links');
    
    // Burger Menu Toggle
    if (burgerMenu && navLinksContainer) {
        burgerMenu.addEventListener('click', function() {
            burgerMenu.classList.toggle('active');
            navLinksContainer.classList.toggle('active');
        });
        
        // Close menu when clicking on a nav link (mobile)
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    burgerMenu.classList.remove('active');
                    navLinksContainer.classList.remove('active');
                }
            });
        });
    }
    
    // Render content panel HTML
    function renderContentPanel(section) {
        const data = contentData[section];
        if (!data) return '';
        
        const itemsHtml = data.items.map((item, index) => 
            `<li style="animation-delay: ${(index + 1) * 0.1}s">${item}</li>`
        ).join('');
        
        // Add research icon for Einleitung section
        const researchIcon = section === 'einleitung' 
            ? '<a href="recherche.html" class="research-icon" title="Recherche öffnen"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg></a>'
            : '';
        
        return `
            <div class="content-panel active" id="content-${section}" data-section="${section}">
                <h2 class="content-title">${data.title}</h2>
                <p class="content-teaser">${data.teaser}</p>
                <div class="content-body fade-in">
                    <h3>${data.subtitle}</h3>
                    <ul>
                        ${itemsHtml}
                    </ul>
                </div>
                ${researchIcon}
            </div>
        `;
    }
    
    // Check for hash in URL and show corresponding section
    const hash = window.location.hash.replace('#', '');
    const initialSection = hash && contentData[hash] ? hash : 'einleitung';
    
    // Initialize: Show content based on hash or default to Einleitung
    contentSection.innerHTML = renderContentPanel(initialSection);
    
    // If hash exists, activate corresponding nav link and cube
    if (hash && contentData[hash]) {
        const hashNavLink = document.querySelector(`.nav-link[data-section="${hash}"]`);
        const hashCubeInput = document.getElementById(`tab-${hash}`);
        
        if (hashNavLink) {
            navLinks.forEach(l => l.classList.remove('active'));
            hashNavLink.classList.add('active');
        }
        
        if (hashCubeInput) {
            hashCubeInput.checked = true;
            const tabIndex = Array.from(cubeInputs).indexOf(hashCubeInput);
            const tabs = document.querySelectorAll('.tab');
            tabs.forEach(tab => tab.classList.remove('active'));
            if (tabs[tabIndex]) {
                tabs[tabIndex].classList.add('active');
            }
        }
    }
    
    // Navigation click handlers
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            
            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding content
            showContent(section);
            
            // Update cube
            const cubeInput = document.getElementById(`tab-${section}`);
            if (cubeInput) {
                cubeInput.checked = true;
                
                // Update active tab
                const tabs = document.querySelectorAll('.tab');
                const tabIndex = Array.from(cubeInputs).indexOf(cubeInput);
                tabs.forEach(tab => tab.classList.remove('active'));
                if (tabs[tabIndex]) {
                    tabs[tabIndex].classList.add('active');
                }
            }
        });
    });
    
    // Cube tab change handlers
    cubeInputs.forEach((input, index) => {
        input.addEventListener('change', function() {
            const section = this.id.replace('tab-', '');
            showContent(section);
            
            // Update active nav link
            navLinks.forEach(l => {
                l.classList.remove('active');
                if (l.getAttribute('data-section') === section) {
                    l.classList.add('active');
                }
            });
            
            // Update active tab
            const tabs = document.querySelectorAll('.tab');
            tabs.forEach(tab => tab.classList.remove('active'));
            if (tabs[index]) {
                tabs[index].classList.add('active');
            }
        });
    });
    
    // Set initial active tab
    const tabs = document.querySelectorAll('.tab');
    if (tabs[0]) {
        tabs[0].classList.add('active');
    }
    
    // Tab click handlers (to update active state when clicked directly)
    tabs.forEach((tab, index) => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    function showContent(section) {
        // Render and show content panel
        contentSection.innerHTML = renderContentPanel(section);
        
        // Trigger fade-in animation
        const contentBody = contentSection.querySelector('.content-body');
        if (contentBody) {
            contentBody.classList.remove('fade-in');
            // Force reflow
            void contentBody.offsetWidth;
            contentBody.classList.add('fade-in');
        }
    }
    
    // Set initial active nav link (first one)
    if (navLinks.length > 0) {
        navLinks[0].classList.add('active');
    }
});

