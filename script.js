class CardNav {
  constructor() {
    this.isHamburgerOpen = false;
    this.isExpanded = false;
    this.navElement = null;
    this.cardsElements = [];
    this.timeline = null;
    this.ease = 'power3.out';
    
    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    this.navElement = document.getElementById('cardNav');
    this.hamburgerMenu = document.getElementById('hamburgerMenu');
    this.cardNavContent = document.getElementById('cardNavContent');
    
    if (!this.navElement || !this.hamburgerMenu || !this.cardNavContent) {
      console.error('CardNav: Required elements not found');
      return;
    }

    // Get all nav cards
    this.cardsElements = Array.from(this.navElement.querySelectorAll('.nav-card'));
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Create initial timeline
    this.createTimeline();
    
    // Setup resize handler
    this.setupResizeHandler();
  }

  setupEventListeners() {
    // Hamburger menu click
    this.hamburgerMenu.addEventListener('click', () => this.toggleMenu());
    
    // Keyboard support
    this.hamburgerMenu.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggleMenu();
      }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (this.isExpanded && !this.navElement.contains(e.target)) {
        this.closeMenu();
      }
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isExpanded) {
        this.closeMenu();
      }
    });
  }

  setupResizeHandler() {
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.handleResize();
      }, 100);
    });
  }

  calculateHeight() {
    if (!this.navElement) return 260;

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    
    if (isMobile) {
      // Temporarily make content visible to measure height
      const wasVisible = this.cardNavContent.style.visibility;
      const wasPointerEvents = this.cardNavContent.style.pointerEvents;
      const wasPosition = this.cardNavContent.style.position;
      const wasHeight = this.cardNavContent.style.height;

      this.cardNavContent.style.visibility = 'visible';
      this.cardNavContent.style.pointerEvents = 'auto';
      this.cardNavContent.style.position = 'static';
      this.cardNavContent.style.height = 'auto';

      // Force reflow
      this.cardNavContent.offsetHeight;

      const topBar = 60;
      const padding = 16;
      const contentHeight = this.cardNavContent.scrollHeight;

      // Restore original styles
      this.cardNavContent.style.visibility = wasVisible;
      this.cardNavContent.style.pointerEvents = wasPointerEvents;
      this.cardNavContent.style.position = wasPosition;
      this.cardNavContent.style.height = wasHeight;

      return topBar + contentHeight + padding;
    }
    
    return 260;
  }

  createTimeline() {
    if (!this.navElement || !gsap) return null;

    // Kill existing timeline
    if (this.timeline) {
      this.timeline.kill();
    }

    // Set initial states
    gsap.set(this.navElement, { height: 60, overflow: 'hidden' });
    gsap.set(this.cardsElements, { y: 50, opacity: 0 });

    // Create new timeline
    this.timeline = gsap.timeline({ paused: true });

    // Animate height
    this.timeline.to(this.navElement, {
      height: this.calculateHeight(),
      duration: 0.4,
      ease: this.ease
    });

    // Animate cards
    this.timeline.to(this.cardsElements, {
      y: 0,
      opacity: 1,
      duration: 0.4,
      ease: this.ease,
      stagger: 0.08
    }, '-=0.1');

    return this.timeline;
  }

  handleResize() {
    if (!this.timeline) return;

    if (this.isExpanded) {
      const newHeight = this.calculateHeight();
      gsap.set(this.navElement, { height: newHeight });

      this.timeline.kill();
      this.createTimeline();
      if (this.timeline) {
        this.timeline.progress(1);
      }
    } else {
      this.timeline.kill();
      this.createTimeline();
    }
  }

  toggleMenu() {
    if (!this.timeline) return;

    if (!this.isExpanded) {
      this.openMenu();
    } else {
      this.closeMenu();
    }
  }

  openMenu() {
    this.isHamburgerOpen = true;
    this.isExpanded = true;
    
    // Update DOM classes
    this.hamburgerMenu.classList.add('open');
    this.navElement.classList.add('open');
    this.cardNavContent.setAttribute('aria-hidden', 'false');
    this.hamburgerMenu.setAttribute('aria-label', 'إغلاق القائمة');
    
    // Play animation
    this.timeline.play(0);
  }

  closeMenu() {
    this.isHamburgerOpen = false;
    
    // Update DOM classes
    this.hamburgerMenu.classList.remove('open');
    this.hamburgerMenu.setAttribute('aria-label', 'فتح القائمة');
    
    // Set callback for when animation completes
    this.timeline.eventCallback('onReverseComplete', () => {
      this.isExpanded = false;
      this.navElement.classList.remove('open');
      this.cardNavContent.setAttribute('aria-hidden', 'true');
    });
    
    // Reverse animation
    this.timeline.reverse();
  }

  // Public methods for external control
  open() {
    if (!this.isExpanded) {
      this.openMenu();
    }
  }

  close() {
    if (this.isExpanded) {
      this.closeMenu();
    }
  }

  toggle() {
    this.toggleMenu();
  }

  isOpen() {
    return this.isExpanded;
  }
}

// Initialize CardNav when DOM is ready
let cardNavInstance = null;

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    cardNavInstance = new CardNav();
  });
} else {
  cardNavInstance = new CardNav();
}

// Typewriter Effect
class TypewriterEffect {
  constructor() {
    this.typewriterText = document.getElementById('typewriterText');
    this.typewriterCursor = document.querySelector('.typewriter-cursor');
    this.typewriterDescription = document.getElementById('typewriterDescription');
    this.typewriterCursorDesc = document.querySelector('.typewriter-cursor-desc');
    this.fullText = 'هل شركتك تحتاج تمويل؟';
    this.descriptionText = 'احسب نسبتك المتوقعة مجانًا وسجّل بياناتك للحصول على فرص تمويل مخصصة.';
    this.currentIndex = 0;
    this.descCurrentIndex = 0;
    this.isDeleting = false;
    this.isDescDeleting = false;
    this.typingSpeed = 100;
    this.deletingSpeed = 50;
    this.pauseDuration = 2000;
    this.descTypingSpeed = 80;
    this.descDeletingSpeed = 40;
    this.descPauseDuration = 3000;
    this.isCompleted = false; // Track if typing is completed
    this.isDescCompleted = false; // Track if description typing is completed
    this.typingTimeout = null; // Store timeout reference
    this.descTypingTimeout = null; // Store description timeout reference
    this.init();
  }

  init() {
    if (!this.typewriterText) return;
    
    // Set initial text to prevent flash
    this.typewriterText.textContent = '';
    this.typewriterDescription.textContent = '';
    
    // Add event listener to prevent any text changes after completion
    this.typewriterText.addEventListener('DOMCharacterDataModified', (e) => {
      if (this.isCompleted) {
        e.preventDefault();
        this.typewriterText.textContent = this.fullText;
      }
    });
    
    this.typewriterDescription.addEventListener('DOMCharacterDataModified', (e) => {
      if (this.isDescCompleted) {
        e.preventDefault();
        this.typewriterDescription.textContent = this.descriptionText;
      }
    });
    
    this.startTyping();
    this.startDescriptionTyping();
  }

  startTyping() {
    if (this.isCompleted) return; // Don't start if already completed
    
    const type = () => {
      if (!this.isDeleting && this.currentIndex < this.fullText.length) {
        // Typing
        this.typewriterText.textContent = this.fullText.substring(0, this.currentIndex + 1);
        this.currentIndex++;
        this.typingTimeout = setTimeout(type, this.typingSpeed);
      } else if (!this.isDeleting && this.currentIndex === this.fullText.length) {
        // Stop after typing is complete - don't delete or restart
        this.isCompleted = true; // Mark as completed
        this.typewriterCursor.style.display = 'none'; // Hide cursor after completion
        
        // Set final text to prevent any changes
        this.typewriterText.textContent = this.fullText;
        
        // Remove any remaining timeouts
        clearTimeout(this.typingTimeout);
        return; // Stop the animation
      }
    };

    // Start after a short delay
    this.typingTimeout = setTimeout(type, 1000);
  }

  startDescriptionTyping() {
    if (!this.typewriterDescription) return;
    if (this.isDescCompleted) return; // Don't start if already completed
    
    const typeDesc = () => {
      if (!this.isDescDeleting && this.descCurrentIndex < this.descriptionText.length) {
        // Typing description
        this.typewriterDescription.textContent = this.descriptionText.substring(0, this.descCurrentIndex + 1);
        this.descCurrentIndex++;
        this.descTypingTimeout = setTimeout(typeDesc, this.descTypingSpeed);
      } else if (!this.isDescDeleting && this.descCurrentIndex === this.descriptionText.length) {
        // Stop after description typing is complete - don't delete or restart
        this.isDescCompleted = true; // Mark as completed
        this.typewriterCursorDesc.style.display = 'none'; // Hide cursor after completion
        
        // Set final text to prevent any changes
        this.typewriterDescription.textContent = this.descriptionText;
        
        // Remove any remaining timeouts
        clearTimeout(this.descTypingTimeout);
        return; // Stop the animation
      }
    };

    // Start description typing after title starts
    this.descTypingTimeout = setTimeout(typeDesc, 2000);
  }
}

// Hero Section Animation
class HeroAnimation {
  constructor() {
    this.heroTitle = document.querySelector('.hero-title');
    this.heroDescription = document.querySelector('.hero-description');
    this.heroButtons = document.querySelectorAll('.btn');
    this.mobileLogo = document.querySelector('.mobile-logo-img');
    this.highlightText = document.querySelector('.highlight-text');
    
    this.init();
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.animate());
    } else {
      this.animate();
    }
  }

  animate() {
    if (!gsap) return;

    // Set initial states
    const elements = [this.heroDescription, this.heroButtons];
    if (this.mobileLogo) {
      elements.unshift(this.mobileLogo);
    }
    
    gsap.set(elements, {
      opacity: 0,
      y: 30
    });

    // Set initial state for title (typewriter will handle it)
    if (this.heroTitle) {
      gsap.set(this.heroTitle, {
        opacity: 1,
        y: 0
      });
    }

    // Create timeline with shorter delay for mobile
    const isMobile = window.innerWidth <= 768;
    const delay = isMobile ? 0.1 : 0.5;
    const tl = gsap.timeline({ delay });

    // Animate mobile logo first (if exists)
    if (this.mobileLogo) {
      tl.to(this.mobileLogo, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power3.out'
      });
    }

    // Animate description (after typewriter starts)
    tl.to(this.heroDescription, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power3.out'
    }, '-=0.2');

    // Animate buttons
    tl.to(this.heroButtons, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: 'power3.out',
      stagger: 0.1
    }, '-=0.2');

    // Add hover effects to buttons
    this.heroButtons.forEach(button => {
      button.addEventListener('mouseenter', () => {
        gsap.to(button, {
          scale: 1.05,
          duration: 0.3,
          ease: 'power2.out'
        });
      });

      button.addEventListener('mouseleave', () => {
        gsap.to(button, {
          scale: 1,
          duration: 0.3,
          ease: 'power2.out'
        });
      });
    });
  }
}

// Initialize Typewriter Effect
let typewriterInstance = null;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    typewriterInstance = new TypewriterEffect();
  });
} else {
  typewriterInstance = new TypewriterEffect();
}

// Initialize Hero Animation
let heroAnimationInstance = null;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    heroAnimationInstance = new HeroAnimation();
  });
} else {
  heroAnimationInstance = new HeroAnimation();
}

// Mobile Dock Navigation
class MobileDock {
  constructor() {
    this.dockItems = [];
    this.isInitialized = false;
    this.init();
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    this.dockItems = document.querySelectorAll('.dock-item');
    if (this.dockItems.length === 0) return;

    this.setupEventListeners();
    this.setupAnimations();
    this.isInitialized = true;
  }

  setupEventListeners() {
    this.dockItems.forEach((item, index) => {
      // Click handler
      item.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleItemClick(item, index);
      });

      // Touch handler for mobile
      item.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.handleItemClick(item, index);
      });

      // Keyboard support
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.handleItemClick(item, index);
        }
      });

      // Hover effects
      item.addEventListener('mouseenter', () => {
        this.handleItemHover(item, true);
      });

      item.addEventListener('mouseleave', () => {
        this.handleItemHover(item, false);
      });
    });
  }

  setupAnimations() {
    if (!gsap) return;

    // Set dock items to be visible immediately
    gsap.set(this.dockItems, {
      scale: 1,
      opacity: 1,
      y: 0
    });
  }

  handleItemClick(item, index) {
    // Add click animation
    gsap.to(item, {
      scale: 0.9,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: 'power2.inOut'
    });

    // Handle navigation based on index
    const actions = [
      () => this.scrollToTop(),
      () => this.scrollToSection('services'),
      () => this.scrollToSection('solutions'),
      () => this.scrollToSection('resources'),
      () => this.showContact()
    ];

    if (actions[index]) {
      actions[index]();
    }
  }

  handleItemHover(item, isHovering) {
    if (!gsap) return;

    const icon = item.querySelector('.dock-icon');
    const label = item.querySelector('.dock-label');

    if (isHovering) {
      gsap.to(item, {
        scale: 1.15,
        y: -12,
        duration: 0.3,
        ease: 'power2.out'
      });

      if (icon) {
        gsap.to(icon, {
          scale: 1.2,
          duration: 0.3,
          ease: 'power2.out'
        });
      }

      if (label) {
        gsap.to(label, {
          opacity: 1,
          y: -8,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    } else {
      gsap.to(item, {
        scale: 1,
        y: 0,
        duration: 0.3,
        ease: 'power2.out'
      });

      if (icon) {
        gsap.to(icon, {
          scale: 1,
          duration: 0.3,
          ease: 'power2.out'
        });
      }

      if (label) {
        gsap.to(label, {
          opacity: 0,
          y: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    }
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  scrollToSection(sectionId) {
    // This would scroll to specific sections
    // For now, just scroll to top
    this.scrollToTop();
  }

  showContact() {
    // This would show contact modal or scroll to contact section
    alert('تواصل معنا - سيتم إضافة نموذج التواصل قريباً');
  }

  // Public method to show/hide dock
  toggle(show) {
    const dock = document.querySelector('.mobile-dock');
    if (!dock) return;

    if (show) {
      gsap.to(dock, {
        y: 0,
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
    } else {
      gsap.to(dock, {
        y: 100,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in'
      });
    }
  }
}

// Initialize Mobile Dock
let mobileDockInstance = null;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    mobileDockInstance = new MobileDock();
  });
} else {
  mobileDockInstance = new MobileDock();
}

// Calculator Form Handler
class CalculatorForm {
  constructor() {
    this.currentStep = 1;
    this.totalSteps = 6;
    this.formData = {};
    this.init();
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    this.form = document.getElementById('calculatorForm');
    this.nextBtn = document.getElementById('nextStep');
    this.prevBtn = document.getElementById('prevStep');
    this.steps = document.querySelectorAll('.form-step');
    this.currentStepElement = document.querySelector('.current-step');
    this.submitContainer = document.querySelector('.form-submit-container');

    if (!this.form || !this.nextBtn || !this.prevBtn) return;

    this.setupEventListeners();
    this.updateStepDisplay();
  }

  setupEventListeners() {
    this.nextBtn.addEventListener('click', () => this.nextStep());
    this.prevBtn.addEventListener('click', () => this.prevStep());
    
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    
    // Auto-advance on select change
    this.steps.forEach(step => {
      const select = step.querySelector('.form-select');
      if (select) {
        select.addEventListener('change', () => {
          if (select.value && this.currentStep < this.totalSteps) {
            setTimeout(() => this.nextStep(), 500);
          }
        });
      }
    });
  }

  nextStep() {
    if (this.currentStep < this.totalSteps) {
      const currentStepElement = this.steps[this.currentStep - 1];
      const select = currentStepElement.querySelector('.form-select');
      
      if (select && select.value) {
        this.formData[select.name] = select.value;
        this.currentStep++;
        this.updateStepDisplay();
        this.animateStepTransition();
      } else {
        this.showValidationMessage('يرجى اختيار خيار من القائمة');
      }
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.updateStepDisplay();
      this.animateStepTransition();
    }
  }

  updateStepDisplay() {
    // Update step visibility
    this.steps.forEach((step, index) => {
      step.classList.toggle('active', index + 1 === this.currentStep);
    });

    // Update step indicator
    if (this.currentStepElement) {
      this.currentStepElement.textContent = this.currentStep;
    }

    // Update navigation buttons
    this.prevBtn.disabled = this.currentStep === 1;
    
    if (this.currentStep === this.totalSteps) {
      this.nextBtn.style.display = 'none';
      this.submitContainer.style.display = 'block';
    } else {
      this.nextBtn.style.display = 'inline-flex';
      this.submitContainer.style.display = 'none';
    }
  }

  animateStepTransition() {
    if (!gsap) return;

    const currentStepElement = this.steps[this.currentStep - 1];
    
    gsap.fromTo(currentStepElement, 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
    );
  }

  showValidationMessage(message) {
    // Create or update validation message
    let validationMsg = document.querySelector('.validation-message');
    if (!validationMsg) {
      validationMsg = document.createElement('div');
      validationMsg.className = 'validation-message';
      validationMsg.style.cssText = `
        background: #ff6b6b;
        color: white;
        padding: 0.75rem 1rem;
        border-radius: 0.5rem;
        margin: 1rem 0;
        text-align: center;
        font-weight: 500;
        animation: slideIn 0.3s ease;
      `;
      
      const currentStep = this.steps[this.currentStep - 1];
      currentStep.appendChild(validationMsg);
    }
    
    validationMsg.textContent = message;
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      if (validationMsg) {
        gsap.to(validationMsg, {
          opacity: 0,
          y: -10,
          duration: 0.3,
          ease: 'power2.in',
          onComplete: () => validationMsg.remove()
        });
      }
    }, 3000);
  }

  handleSubmit(e) {
    e.preventDefault();
    
    // Collect all form data
    const formData = new FormData(this.form);
    const data = Object.fromEntries(formData);
    
    // Simulate calculation
    this.showCalculationResult(data);
  }

  showCalculationResult(data) {
    // Create result modal
    const modal = document.createElement('div');
    modal.className = 'calculation-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      padding: 2rem;
    `;

    const resultCard = document.createElement('div');
    resultCard.style.cssText = `
      background: white;
      border-radius: 1rem;
      padding: 2rem;
      max-width: 500px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      transform: scale(0.8);
      transition: transform 0.3s ease;
    `;

    // Calculate mock result
    const score = this.calculateScore(data);
    const percentage = Math.round(score * 100);
    
    resultCard.innerHTML = `
      <div style="margin-bottom: 2rem;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">🎯</div>
        <h3 style="font-size: 1.5rem; font-weight: 600; color: #2c3e50; margin-bottom: 1rem;">
          نتيجة حساب الأهلية
        </h3>
        <div style="font-size: 2.5rem; font-weight: 700; color: #667eea; margin-bottom: 1rem;">
          ${percentage}%
        </div>
        <p style="color: #6c757d; line-height: 1.6; margin-bottom: 2rem;">
          ${this.getResultMessage(percentage)}
        </p>
      </div>
      <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
        <button onclick="this.closest('.calculation-modal').remove()" 
                style="background: #667eea; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; font-weight: 600;">
          إغلاق
        </button>
        <button onclick="window.location.reload()" 
                style="background: #28a745; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; font-weight: 600;">
          حساب جديد
        </button>
      </div>
    `;

    modal.appendChild(resultCard);
    document.body.appendChild(modal);

    // Animate modal
    setTimeout(() => {
      resultCard.style.transform = 'scale(1)';
    }, 100);

    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  calculateScore(data) {
    let score = 0.5; // Base score
    
    // Business type scoring
    const businessTypeScores = {
      'technology': 0.9,
      'healthcare': 0.85,
      'services': 0.8,
      'manufacturing': 0.75,
      'retail': 0.7,
      'wholesale': 0.65,
      'construction': 0.6,
      'education': 0.7,
      'restaurants': 0.5,
      'other': 0.5
    };
    
    if (data.businessType && businessTypeScores[data.businessType]) {
      score += businessTypeScores[data.businessType] * 0.2;
    }
    
    // Revenue scoring
    const revenueScores = {
      'less-187500': 0.3,
      '187500-375000': 0.4,
      '375000-937500': 0.5,
      '937500-1875000': 0.6,
      '1875000-3750000': 0.7,
      'more-3750000': 0.8
    };
    
    if (data.annualRevenue && revenueScores[data.annualRevenue]) {
      score += revenueScores[data.annualRevenue] * 0.2;
    }
    
    // Profit margin scoring
    const profitScores = {
      'less-10': 0.2,
      '10-20': 0.4,
      '20-30': 0.6,
      '30-40': 0.8,
      '40-50': 0.9,
      'more-50': 1.0
    };
    
    if (data.profitMargin && profitScores[data.profitMargin]) {
      score += profitScores[data.profitMargin] * 0.2;
    }
    
    // Company age scoring
    const ageScores = {
      'less-1': 0.3,
      '1-2': 0.4,
      '3-5': 0.6,
      '6-10': 0.8,
      '11-20': 0.9,
      'more-20': 1.0
    };
    
    if (data.companyAge && ageScores[data.companyAge]) {
      score += ageScores[data.companyAge] * 0.2;
    }
    
    // Employee count scoring
    const employeeScores = {
      '1-5': 0.4,
      '6-10': 0.5,
      '11-25': 0.6,
      '26-50': 0.7,
      '51-100': 0.8,
      'more-100': 0.9
    };
    
    if (data.employees && employeeScores[data.employees]) {
      score += employeeScores[data.employees] * 0.1;
    }
    
    return Math.min(Math.max(score, 0), 1);
  }

  getResultMessage(percentage) {
    if (percentage >= 80) {
      return 'ممتاز! شركتك مؤهلة للحصول على تمويل ممتاز بمعدلات فائدة تنافسية.';
    } else if (percentage >= 60) {
      return 'جيد جداً! شركتك مؤهلة للحصول على تمويل جيد مع شروط معقولة.';
    } else if (percentage >= 40) {
      return 'مقبول. يمكن لشركتك الحصول على تمويل مع بعض الشروط الإضافية.';
    } else {
      return 'يحتاج إلى تحسين. ننصح بتحسين الوضع المالي قبل التقدم للتمويل.';
    }
  }
}

// Initialize Calculator Form
let calculatorFormInstance = null;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    calculatorFormInstance = new CalculatorForm();
  });
} else {
  calculatorFormInstance = new CalculatorForm();
}

// Smooth Scrolling Functions
function scrollToCalculator() {
  const calculatorSection = document.getElementById('calculator');
  if (calculatorSection) {
    calculatorSection.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  }
}

function scrollToArticles() {
  const articlesSection = document.getElementById('articles');
  if (articlesSection) {
    articlesSection.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  }
}

// Enhanced Mobile Dock Navigation
function updateMobileDockNavigation() {
  if (mobileDockInstance) {
    // Update dock item actions
    const actions = [
      () => window.scrollTo({ top: 0, behavior: 'smooth' }),
      () => scrollToCalculator(),
      () => scrollToCalculator(), // Solutions redirect to calculator
      () => scrollToArticles(),
      () => showContactModal()
    ];

    // Update dock item click handlers
    const dockItems = document.querySelectorAll('.dock-item');
    dockItems.forEach((item, index) => {
      item.onclick = actions[index] || (() => {});
    });
  }
}

// Contact Modal
function showContactModal() {
  const modal = document.createElement('div');
  modal.className = 'contact-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    padding: 2rem;
  `;

  const contactCard = document.createElement('div');
  contactCard.style.cssText = `
    background: white;
    border-radius: 1rem;
    padding: 2rem;
    max-width: 500px;
    width: 100%;
    text-align: center;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    transform: scale(0.8);
    transition: transform 0.3s ease;
  `;

  contactCard.innerHTML = `
    <div style="margin-bottom: 2rem;">
      <div style="font-size: 3rem; margin-bottom: 1rem;">📞</div>
      <h3 style="font-size: 1.5rem; font-weight: 600; color: #2c3e50; margin-bottom: 1rem;">
        تواصل معنا
      </h3>
      <div style="text-align: right; margin-bottom: 1.5rem;">
        <p style="color: #6c757d; margin-bottom: 0.5rem;"><strong>البريد الإلكتروني:</strong> info@nsbh.co</p>
        <p style="color: #6c757d; margin-bottom: 0.5rem;"><strong>الهاتف:</strong> +966 50 123 4567</p>
        <p style="color: #6c757d;"><strong>العنوان:</strong> الرياض، المملكة العربية السعودية</p>
      </div>
    </div>
    <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
      <button onclick="this.closest('.contact-modal').remove()" 
              style="background: #667eea; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; font-weight: 600;">
        إغلاق
      </button>
      <button onclick="window.open('mailto:info@nsbh.co', '_blank')" 
              style="background: #28a745; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; font-weight: 600;">
        إرسال بريد
      </button>
    </div>
  `;

  modal.appendChild(contactCard);
  document.body.appendChild(modal);

  // Animate modal
  setTimeout(() => {
    contactCard.style.transform = 'scale(1)';
  }, 100);

  // Close on background click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// Initialize enhanced navigation
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    updateMobileDockNavigation();
  });
} else {
  updateMobileDockNavigation();
}

// Export for external use
window.CardNav = CardNav;
window.cardNavInstance = cardNavInstance;
window.TypewriterEffect = TypewriterEffect;
window.typewriterInstance = typewriterInstance;
window.HeroAnimation = HeroAnimation;
window.heroAnimationInstance = heroAnimationInstance;
window.MobileDock = MobileDock;
window.mobileDockInstance = mobileDockInstance;
window.CalculatorForm = CalculatorForm;
window.calculatorFormInstance = calculatorFormInstance;
window.scrollToCalculator = scrollToCalculator;
window.scrollToArticles = scrollToArticles;
window.showContactModal = showContactModal;

// Loading Screen Handler
class LoadingScreen {
  constructor() {
    this.loadingScreen = document.getElementById('loadingScreen');
    this.minLoadingTime = 2000; // Minimum loading time in milliseconds
    this.startTime = Date.now();
    this.init();
  }

  init() {
    if (!this.loadingScreen) return;
    
    // Show loading screen immediately
    this.showLoadingScreen();
    
    // Hide loading screen when page is fully loaded
    this.hideLoadingScreen();
  }

  showLoadingScreen() {
    if (this.loadingScreen) {
      this.loadingScreen.style.display = 'flex';
      this.loadingScreen.style.opacity = '1';
    }
  }

  hideLoadingScreen() {
    const hideLoader = () => {
      const elapsedTime = Date.now() - this.startTime;
      const remainingTime = Math.max(0, this.minLoadingTime - elapsedTime);
      
      setTimeout(() => {
        if (this.loadingScreen) {
          this.loadingScreen.classList.add('fade-out');
          
          // Remove from DOM after fade animation
          setTimeout(() => {
            if (this.loadingScreen) {
              this.loadingScreen.style.display = 'none';
            }
          }, 500); // Match CSS transition duration
        }
      }, remainingTime);
    };

    // Hide when page is fully loaded
    if (document.readyState === 'complete') {
      hideLoader();
    } else {
      window.addEventListener('load', hideLoader);
    }
  }

  // Public method to show loading screen manually
  show() {
    this.showLoadingScreen();
  }

  // Public method to hide loading screen manually
  hide() {
    this.hideLoadingScreen();
  }
}

// Initialize Loading Screen
let loadingScreenInstance = null;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    loadingScreenInstance = new LoadingScreen();
  });
} else {
  loadingScreenInstance = new LoadingScreen();
}

// Export for external use
window.LoadingScreen = LoadingScreen;
window.loadingScreenInstance = loadingScreenInstance;