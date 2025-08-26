// ============================================================================
// GLOBAL STATE & CONTROL VARIABLES
// ============================================================================

// Core navigation state
const sections = [...document.querySelectorAll('.panel')];
const contents = sections.map(s => s.querySelector('.content'));
let current = 0;
let isAnimating = false;

// Navigation elements
const navBtns = [...document.querySelectorAll('.nav-btn')];
const sectionHeading = document.getElementById('sectionHeading');
const navButtons = document.getElementById('navButtons');
const scrollIndicator = document.getElementById('indicators');

// Section names mapping
const sectionNames = {
  'heading': 'About Me',
  'codeSkills': 'Skills', 
  'projects': 'Projects',
  'testimony': 'Testimony',
  'contact': 'Contact Me'
};

// Touch navigation
let touchStartY = 0;

// Scroll control state
let isScrollDisabled = false;

// Globe animation reference
let globeAnimation = null;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Icon rendering - Initialize Feather icons
document.addEventListener('DOMContentLoaded', () => {
  if (window.feather && typeof window.feather.replace === 'function') {
    try {
      window.feather.replace();
    } catch (error) {
      console.warn('Feather icons failed to initialize:', error);
    }
  }
});

// Sleep utility for typing animation
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ============================================================================
// Z-INDEX MANAGEMENT
// ============================================================================

// Constants
const ACTIVE_Z_INDEX = 1000;
const SKILL_SPREAD_X = 400;
const SKILL_SPREAD_Y = 300;
const SOCIAL_SPREAD_X = 300;
const SOCIAL_SPREAD_Y = 200;
const TESTIMONIALS_PER_PAGE = 3;

// Controls section layering during transitions
function setActiveZIndex(index) {
  sections.forEach((section, i) => {
    section.style.zIndex = i === index ? ACTIVE_Z_INDEX : '1';
  });
}



// ============================================================================
// ELEMENT POSITION MANAGEMENT
// ============================================================================

// Animation control variables
const RANDOMIZE_SPREAD = 0.8;
const ROTATION_RANGE = 20;

function applyRandomTransform(elements, spreadX, spreadY, rotationRange) {
  elements.forEach(element => {
    const randomX = (Math.random() - 0.5) * spreadX;
    const randomY = (Math.random() - 0.5) * spreadY;
    const rotation = Math.random() * rotationRange - rotationRange / 2;
    gsap.set(element, { x: randomX, y: randomY, rotation });
  });
}

function randomizeElements(content) {
  const children = [...content.children];
  const rect = content.getBoundingClientRect();
  
  applyRandomTransform(children, rect.width * RANDOMIZE_SPREAD, rect.height * RANDOMIZE_SPREAD, ROTATION_RANGE);
  
  const skillGrid = content.querySelector('.skill-grid');
  const socialLinks = content.querySelector('.social-grid');
  const bentoGrid = content.querySelector('.bento-grid');
  
  if (skillGrid) {
    applyRandomTransform([...skillGrid.children], SKILL_SPREAD_X, SKILL_SPREAD_Y, 10);
  }
  
  if (socialLinks) {
    applyRandomTransform([...socialLinks.children], SOCIAL_SPREAD_X, SOCIAL_SPREAD_Y, 15);
  }
  
  if (bentoGrid) {
    applyRandomTransform([...bentoGrid.children], SKILL_SPREAD_X, SKILL_SPREAD_Y, 10);
  }
}

function resetElements(elements) {
  elements.forEach(element => {
    gsap.set(element, { x: 0, y: 0, rotation: 0 });
  });
}

function resetToOriginalPositions(content) {
  const children = [...content.children];
  resetElements(children);
  
  const skillGrid = content.querySelector('.skill-grid');
  const socialLinks = content.querySelector('.social-grid');
  const bentoGrid = content.querySelector('.bento-grid');
  
  if (skillGrid) {
    resetElements([...skillGrid.children]);
  }
  
  if (socialLinks) {
    resetElements([...socialLinks.children]);
  }
  
  if (bentoGrid) {
    resetElements([...bentoGrid.children]);
  }
}

// Initialize section positions on page load
function initPositions() {
  contents.forEach((el, i) => {
    if (i === 0) {
      gsap.set(el, { x: 0, y: 0, opacity: 1, filter: 'blur(0px)' });
      resetToOriginalPositions(el);
    } else {
      gsap.set(el, { y: window.innerHeight, x: 0, opacity: 0, filter: 'blur(8px)' });
      randomizeElements(el);
    }
  });
  setActiveZIndex(0);
}

// ============================================================================
// SECTION TRANSITION SYSTEM
// ============================================================================

// Transition control variables
const TRANSITION_DURATION = 0.5;
const CHILD_ANIMATION_DURATION = 0.6;

// Define unique transition directions for each section
function sectionDirection(i) {
  const pattern = ['down', 'right', 'left', 'right', 'left'];
  return pattern[i % pattern.length];
}

// Calculate offset positions for section transitions
function offsetFor(direction, magnitudeX = window.innerWidth, magnitudeY = window.innerHeight) {
  switch (direction) {
    case 'left':  return { x: -magnitudeX, y: 0 };
    case 'right': return { x:  magnitudeX, y: 0 };
    case 'up':    return { x: 0, y: -magnitudeY };
    case 'down':  return { x: 0, y:  magnitudeY };
    default:      return { x: 0, y: magnitudeY };
  }
}

function animateChildrenToRandom(content) {
  const children = [...content.children];
  const rect = content.getBoundingClientRect();
  const tl = gsap.timeline();
  
  // Pre-calculate random values for better performance
  const childrenValues = children.map(() => ({
    x: (Math.random() - 0.5) * rect.width * RANDOMIZE_SPREAD,
    y: (Math.random() - 0.5) * rect.height * RANDOMIZE_SPREAD,
    rotation: Math.random() * ROTATION_RANGE - 10
  }));
  
  children.forEach((child, i) => {
    tl.to(child, {
      ...childrenValues[i],
      duration: TRANSITION_DURATION,
      ease: 'power2.inOut'
    }, i * 0.05);
  });
  
  const skillGrid = content.querySelector('.skill-grid');
  const socialLinks = content.querySelector('.social-grid');
  const bentoGrid = content.querySelector('.bento-grid');
  
  if (skillGrid) {
    const skills = [...skillGrid.children];
    skills.forEach((skill, i) => {
      tl.to(skill, {
        x: (Math.random() - 0.5) * SKILL_SPREAD_X,
        y: (Math.random() - 0.5) * SKILL_SPREAD_Y,
        rotation: Math.random() * 10 - 5,
        duration: TRANSITION_DURATION,
        ease: 'power2.inOut'
      }, i * 0.02);
    });
  }
  
  if (socialLinks) {
    const links = [...socialLinks.children];
    if (typeof globeAnimation !== 'undefined' && globeAnimation) {
      globeAnimation.reverse();
    }
    links.forEach((link, i) => {
      tl.to(link, {
        x: (Math.random() - 0.5) * SOCIAL_SPREAD_X,
        y: (Math.random() - 0.5) * SOCIAL_SPREAD_Y,
        rotation: Math.random() * 15 - 7.5,
        duration: TRANSITION_DURATION,
        ease: 'power2.inOut'
      }, i * 0.1);
    });
  }
  
  if (bentoGrid) {
    const projects = [...bentoGrid.children];
    projects.forEach((project, i) => {
      tl.to(project, {
        x: (Math.random() - 0.5) * SKILL_SPREAD_X,
        y: (Math.random() - 0.5) * SKILL_SPREAD_Y,
        rotation: Math.random() * 10 - 5,
        duration: TRANSITION_DURATION,
        ease: 'power2.inOut'
      }, i * 0.02);
    });
  }
  
  return tl;
}

function animateChildrenToOriginal(content) {
  const children = [...content.children];
  const tl = gsap.timeline();
  
  const resetConfig = {
    x: 0, y: 0, rotation: 0,
    duration: CHILD_ANIMATION_DURATION,
    ease: 'back.out(1.7)'
  };
  
  tl.to(children, { ...resetConfig, stagger: 0.08 }, 0);
  
  const skillGrid = content.querySelector('.skill-grid');
  const socialLinks = content.querySelector('.social-grid');
  const bentoGrid = content.querySelector('.bento-grid');
  
  if (skillGrid) {
    const skills = [...skillGrid.children];
    tl.to(skills, { ...resetConfig, stagger: 0.03 }, 0.15);
  }
  
  if (socialLinks) {
    const links = [...socialLinks.children];
    tl.to(links, { ...resetConfig, stagger: 0.12 }, 0.2);
  }
  
  if (bentoGrid) {
    const projects = [...bentoGrid.children];
    tl.to(projects, { ...resetConfig, stagger: 0.03 }, 0.15);
  }
  
  return tl;
}

// Main section transition function
function goToSection(target) {
  if (isAnimating || target === current || target < 0 || target >= sections.length) return;
  isAnimating = true;

  const inDir = sectionDirection(target);
  const outDir = inDir;
  const outEl = contents[current];
  const inEl = contents[target];
  const inFrom = offsetFor(inDir);
  const outTo = offsetFor(outDir);

  gsap.set(inEl, { x: inFrom.x, y: inFrom.y, opacity: 0, filter: 'blur(8px)' });

  const tl = gsap.timeline({
    defaults: { ease: 'power3.inOut' },
    onStart: () => {
      setActiveZIndex(target);
      animateHeadingOut(() => {
        setTimeout(() => {
          const currentSectionId = sections[target].id;
          const currentSectionName = sectionNames[currentSectionId];
          animateHeadingIn(currentSectionName);
        }, 400);
      });
    },
    onComplete: () => {
      current = target;
      isAnimating = false;
      updateNavButtons();

      // Start animations for current section
      const currentSectionId = sections[current].id;
      if (currentSectionId === 'testimony') animateTestimonialsIn();
      if (currentSectionId === 'contact') animateContactIn();
    }
  });

  // Animation sequence: randomize → move sections → restore
  tl.add(animateChildrenToRandom(outEl), 0);
  tl.to(outEl, {
    x: outTo.x, y: outTo.y, opacity: 0, filter: 'blur(10px)',
    duration: 0.4
  }, 0.1);
  tl.to(inEl, {
    x: 0, y: 0, opacity: 1, filter: 'blur(0px)',
    duration: CHILD_ANIMATION_DURATION
  }, 0.2);
  tl.add(animateChildrenToOriginal(inEl), 0.3);
  tl.fromTo(inEl, 
    { rotateX: inDir === 'up' || inDir === 'down' ? 5 : 0, rotateY: inDir === 'left' || inDir === 'right' ? 5 : 0, transformOrigin: '50% 50%' },
    { rotateX: 0, rotateY: 0, duration: CHILD_ANIMATION_DURATION }, 0.2);
}

function updateNavButtons() {
  const currentSectionId = sections[current].id;
  navBtns.forEach(btn => btn.classList.remove('active'));
  const activeBtn = navBtns.find(btn => btn.dataset.section === currentSectionId);
  if (activeBtn) activeBtn.classList.add('active');
  updateIndicators();
}

function updateIndicators() {
  if (scrollIndicator) {
    if (current === sections.length - 1) {
      gsap.to(scrollIndicator, { rotation: 180, duration: 0.3, ease: 'power2.out' });
      gsap.delayedCall(0.3, () => {
        gsap.to(scrollIndicator, { y: -1, duration: 0.3, ease: 'power2.inOut', repeat: -1, yoyo: true });
      });
    } else {
      gsap.to(scrollIndicator, { rotation: 0, duration: 0.3, ease: 'power2.out' });
      gsap.delayedCall(0.3, () => {
        gsap.to(scrollIndicator, { y: 1, duration: 0.3, ease: 'power2.inOut', repeat: -1, yoyo: true });
      });
    }
  }
}

function animateHeadingOut(callback) {
  const currentLetters = Array.from(sectionHeading.children);
  gsap.to(currentLetters, {
    x: -100,
    opacity: 0,
    duration: 0.3,
    stagger: 0.05,
    ease: 'power2.in',
    onComplete: callback
  });
}

function wrapTextInSpans(text) {
  return text.split('').map(char => 
    char === ' ' ? '<span class="letter">&nbsp;</span>' : `<span class="letter">${char}</span>`
  ).join('');
}

function animateHeadingIn(newText) {
  sectionHeading.innerHTML = wrapTextInSpans(newText);
  
  const newLetters = [...sectionHeading.children];
  gsap.set(newLetters, { x: -100, opacity: 0 });
  
  gsap.to(newLetters, {
    x: 0,
    opacity: 1,
    duration: 0.4,
    stagger: 0.05,
    ease: 'back.out(1.7)'
  });
}



// ============================================================================
// INPUT HANDLERS
// ============================================================================

// Mouse wheel navigation
function onWheel(e) {
  e.preventDefault();
  if (isAnimating || isScrollDisabled) return;
  const dir = Math.sign(e.deltaY);
  if (dir > 0) goToSection(current + 1);
  else if (dir < 0) goToSection(current - 1);
}

// Keyboard navigation
addEventListener('keydown', (e) => {
  if (isAnimating || isScrollDisabled) return;
  if (e.key === 'ArrowDown' || e.key === 'PageDown') goToSection(current + 1);
  if (e.key === 'ArrowUp' || e.key === 'PageUp') goToSection(current - 1);
});

// Touch navigation
addEventListener('touchstart', (e) => { touchStartY = e.touches[0].clientY; }, { passive: true });
addEventListener('touchmove', (e) => { if (!isScrollDisabled) e.preventDefault(); }, { passive: false });
addEventListener('touchend', (e) => {
  if (isAnimating || isScrollDisabled) return;
  const dy = e.changedTouches[0].clientY - touchStartY;
  const threshold = 40;
  if (dy < -threshold) goToSection(current + 1);
  if (dy > threshold) goToSection(current - 1);
}, { passive: false });

// Navigation button clicks
if (navBtns && navBtns.length > 0) {
  navBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (isAnimating) return;
      const targetId = btn.dataset.section;
      const targetIndex = sections.findIndex(s => s.id === targetId);
      if (targetIndex >= 0 && targetIndex !== current) {
        goToSection(targetIndex);
      }
    });
  });
}

// ============================================================================
// SECTION-SPECIFIC ANIMATIONS
// ============================================================================



// Typing animation control variables
const roles = ["Problem Solver", "Tech Enthusiast", "Web Designer", "UI Designer", "Graduate", "Team Player"];
const roleSpan = document.getElementById('dynamic-role');
const TYPING_SPEED = 60;
const DELETE_SPEED = 30;
const PAUSE_DURATION = 1200;

async function typeText(el, text, speed = 70) {
  el.textContent = "";
  for (const ch of text) { 
    el.textContent += ch; 
    await sleep(speed); 
  }
}

async function deleteText(el, speed = 40) {
  const text = el.textContent;
  for (let i = text.length; i >= 0; i--) {
    el.textContent = text.substring(0, i);
    await sleep(speed);
  }
}

// Continuous role cycling animation
(async function cycleRoles() {
  let i = 0;
  while (true) {
    await typeText(roleSpan, roles[i], TYPING_SPEED);
    await sleep(PAUSE_DURATION);
    await deleteText(roleSpan, DELETE_SPEED);
    await sleep(300);
    i = (i + 1) % roles.length;
  }
})();

// SKILLS SECTION: Interactive skill grid and progress bar
const skills = [
  { name: "HTML", functionality: "Frontend", prof: 7.5, usage: "A", desc: "The standard markup language for creating web pages. HTML was first introduced in 1993. It is primarily used for structuring content on the World Wide Web, but its applications extend beyond traditional web pages. Popular Alternatives: Pug.", logo: "logos/html.png", bg: "bg/Frontend.png" },
  { name: "CSS", functionality: "Frontend", prof: 8, usage: "B", desc: "A stylesheet language used for describing the presentation of a document written in HTML. CSS was first released in 1996. It is most commonly used for styling web pages and user interfaces. Popular Alternatives: Sass, Less, Stylus.", logo: "logos/css.png", bg: "bg/Frontend.png" },
  { name: "SASS", functionality: "Frontend", prof: 9, usage: "A", desc: "A preprocessor scripting language that is compiled into CSS. Sass was first released in 2006. It is primarily used for writing more maintainable and powerful stylesheets. Popular Alternatives: Less, Stylus.", logo: "logos/sass.png", bg: "bg/Frontend.png" },
  { name: "FIGMA", functionality: "Design", prof: 6, usage: "A", desc: "A collaborative, web-based interface design and prototyping tool. Figma was first released in 2016. It is most commonly used for UI/UX design, wireframing, and creating interactive prototypes. Popular Alternatives: Sketch, Adobe XD.", logo: "logos/figma.png", bg: "bg/Design.png" },
  { name: "JAVASCRIPT", functionality: "Frontend", prof: 7, usage: "A", desc: "A high-level, interpreted programming language. JavaScript was first introduced in 1995. It is most commonly used for creating interactive and dynamic content on websites. Popular Alternatives: TypeScript, CoffeeScript.", logo: "logos/js.png", bg: "bg/Frontend.png" },
  { name: "JQUERY", functionality: "Frontend", prof: 7, usage: "C", desc: "A fast, small, and feature-rich JavaScript library. jQuery was first released in 2006. It is most commonly used for simplifying client-side HTML scripting. Popular Alternatives: Vanilla JavaScript, React, Vue.js.", logo: "logos/jquery.png", bg: "bg/Frontend.png" },
  { name: "REACT", functionality: "Frontend", prof: 6.5, usage: "A", desc: "A free and open-source front-end JavaScript library for building user interfaces. React was first released in 2013. It is most commonly used for developing single-page or mobile applications. Popular Alternatives: Angular, Vue.js, Svelte.", logo: "logos/react.png", bg: "bg/Frontend.png" },
  { name: "TAILWIND", functionality: "Frontend", prof: 8, usage: "A", desc: "A utility-first CSS framework for rapidly building custom user interfaces. Tailwind was first released in 2017. It is most commonly used for building responsive web designs directly in your markup. Popular Alternatives: Bootstrap, Bulma.", logo: "logos/tw.png", bg: "bg/Frontend.png" },
  { name: "BOOTSTRAP", functionality: "Frontend", prof: 8, usage: "C", desc: "A free and open-source CSS framework directed at responsive, mobile-first front-end web development. Bootstrap was first released in 2011. It is most commonly used for creating responsive, mobile-first web pages with pre-built components. Popular Alternatives: Tailwind CSS, Foundation.", logo: "logos/bst.png", bg: "bg/Frontend.png" },
  { name: "THREE", functionality: "Frontend", prof: 5, usage: "A", desc: "A cross-browser JavaScript library and application programming interface used to create and display animated 3D computer graphics. Three.js was first released in 2010. It is most commonly used for creating interactive 3D graphics and animations on web browsers. Popular Alternatives: Babylon.js, PlayCanvas.", logo: "logos/three.png", bg: "bg/Frontend.png" },
  { name: "C/C++", functionality: "Backend", prof: 7, usage: "C", desc: "General-purpose programming languages known for their efficiency and low-level memory manipulation. C was created in 1972, and C++ was created in 1985. They are most commonly used in system/application software, game development, and embedded systems. Popular Alternatives: Rust, Go.", logo: "logos/cpp.png", bg: "bg/Backend.png" },
  { name: "MATLAB", functionality: "Backend", prof: 5, usage: "C", desc: "A proprietary multi-paradigm programming language and numeric computing environment. MATLAB was first released in 1984. It is most commonly used for numerical analysis, matrix manipulation, and algorithm development. Popular Alternatives: Python with NumPy/SciPy, R, Julia.", logo: "logos/matlab.png", bg: "bg/Backend.png" },
  { name: "NODE", functionality: "Backend", prof: 5.5, usage: "A", desc: "A back-end JavaScript runtime environment. Node.js was first released in 2009. It is most commonly used for building scalable network applications, APIs, and microservices. Popular Alternatives: Python, Go, Java.", logo: "logos/nodejs.png", bg: "bg/Backend.png" },
  { name: "PHOTOSHOP", functionality: "Design", prof: 7, usage: "B", desc: "An image creation, graphic design, and photo editing software. Photoshop was first released in 1990. It is most commonly used for photo manipulation, image retouching, and digital painting. Popular Alternatives: GIMP, Affinity Photo.", logo: "logos/ps.png", bg: "bg/Design.png" },
  { name: "ILLUSTRATOR", functionality: "Design", prof: 6.5, usage: "C", desc: "A vector graphics editor and design program. Illustrator was first released in 1987. It is most commonly used for creating logos, icons, and illustrations. Popular Alternatives: Inkscape, CorelDRAW, Affinity Designer.", logo: "logos/ai.png", bg: "bg/Design.png" },
];


// Skill grid elements
const skillGrid = document.getElementById('skillGrid');
const vbar = document.getElementById('vbar');
const vbarWrap = document.getElementById('vbarWrap');
const vbarSkill = document.getElementById('vbar-skill');
const vbarValue = document.getElementById('vbar-value');
const skillsDescription = document.getElementById('skillsDescription');
const codeSkillsContent = document.querySelector('#codeSkills .content');

let currentBackground = null;

// Build interactive skill buttons
skills.forEach(s => {
  const b = document.createElement('button');
  
  // Add logo image
  const logo = document.createElement('img');
  logo.src = s.logo;
  logo.alt = s.name;
  logo.className = 'skill-logo';
  logo.loading = 'lazy';
  
  b.appendChild(logo);
  b.appendChild(document.createTextNode(s.name));

  b.addEventListener('click', () => {
    // Remove active class from all buttons
    document.querySelectorAll('.skill-grid button').forEach(btn => btn.classList.remove('active'));
    
    // Add active class to clicked button
    b.classList.add('active');
    
    const val = Math.max(0, Math.min(10, s.prof));
    const pct = (val / 10) * 100;
    vbarSkill.textContent = s.name;
    vbarValue.textContent = `${val}/10`;
    
    // Update description with typing animation
    typeText(skillsDescription, s.desc, 2);

    // Update progress bar colors based on usage
    if (s.usage === 'A') {
      vbar.style.background = 'linear-gradient(180deg, #fbbf24, #f59e0b, #d97706, #dc2626)';
    } else if (s.usage === 'B') {
      vbar.style.background = 'linear-gradient(180deg, #8b5cf6, #7c3aed)';
    } else {
      vbar.style.background = 'linear-gradient(180deg, #6b7280, #4b5563)';
    }

    if (window.innerWidth <= 768) {
      vbar.style.height = '100%';
      vbar.style.width = '0%';
      requestAnimationFrame(() => {
        vbar.style.width = `${pct}%`;
      });
    } else {
      vbar.style.width = 'auto';
      vbar.style.height = '0%';
      requestAnimationFrame(() => {
        vbar.style.height = `${pct}%`;
      });
    }
    
    // Change background only if different
    if (s.bg !== currentBackground) {
      codeSkillsContent.style.backgroundImage = `url('${s.bg}')`;
      currentBackground = s.bg;
    }
  });

  skillGrid.appendChild(b);
});

// Initialize with HTML skill active
function initializeSkills() {
  const htmlSkill = skills.find(s => s.name === 'HTML');
  if (htmlSkill) {
    const htmlButton = Array.from(skillGrid.children).find(btn => btn.textContent.includes('HTML'));
    if (htmlButton) {
      htmlButton.click();
    }
  }
}

// PROJECTS SECTION: Generate bento grid
const projects = [
  {
    "Name": "Automated Speed Governor Using RFiD",
    "img": "bg/img1.jpg",
    "Languages": ["C++", "Arduino", "Embedded C"],
    "pDec": "Developed a prototype for an automated speed governor system using RFID technology during college. The system controls vehicle speed by reading data from RFID tags placed on the road, automatically adjusting the vehicle's speed(among others) to comply with posted limits.",
    "url":"#"
  },
  {
    "Name": "Reusable 3D Backgrounds",
    "img": "bg/img2.jpg",
    "Languages": ["JavaScript", "WebGL", "Three.js", "gsap"],
    "pDec": "Created few interactive 3D backgrounds...few that cant be interacted with... and a few just good old 2D animations.",
    "url":"#"
  },
  {
    "Name": "My Tourism Website",
    "img": "bg/img3.jpg",
    "Languages": ["HTML", "CSS", "JavaScript", "PHP", "SQL", "jQuery"],
    "pDec": "Designed and developed a comprehensive tourism website. The site features dynamic content management with PHP, a SQL database for storing hotel information and queries, and an interactive front-end using JavaScript and jQuery to enhance user experience.",
    "url":"#"
  },
  {
    "Name": "Fan-made Dota 2 Website",
    "img": "bg/img4.jpg",
    "Languages": ["HTML", "CSS", "JavaScript"],
    "pDec": "Just another fan-made website for the popular game, Dota 2. Design achieved using pure HTML, CSS, and JavaScript.",
    "url":"#"
  },
  {
    "Name": "Gaming Lounge Website - Wild Gaming Cafe",
    "img": "bg/img5.jpg",
    "Languages": ["React, JavaScript, ParticleJs"],
    "pDec": "A custom made website for a Gaming Cafe. Made with lots of unnecessary but fun animations and a team",
    "url":"https://www.wildgamingcafe.com/"
  },
  {
    "Name": "Content Scrapper Extension",
    "img": "bg/img6.jpg",
    "Languages": ["JavaScript"],
    "pDec": "Built a browser extension that scrapes specific content from a specific website. The tool automates the extraction of data upon detecting the required page, and stores data as json.",
    "url":"#"
  },
  {
    "Name": "Graphic Designs",
    "img": "bg/img7.jpg",
    "Languages": ["Adobe Photoshop", "Adobe Illustrator"],
    "pDec": "A collection of graphic design work including logos, posters, and digital illustrations created for personal projects using Adobe Photoshop and Illustrator.",
    "url":"#"
  },
  {
    "Name": "Photo Edits",
    "img": "bg/img8.jpg",
    "Languages": ["Adobe Photoshop", "MatLab"],
    "pDec": "A portfolio of photo editing and manipulation projects. These edits focus on color correction, retouching, edge detection etc.",
    "url":"#"
  },
  {
    "Name": "Snake Game",
    "img": "bg/img9.jpg",
    "Languages": ["Javascript"],
    "pDec": "A classic Snake game created as a web-based application. ",
    "url":"#"
  },
  {
    "Name": "Generic Website",
    "img": "bg/img10.jpg",
    "Languages": ["HTML", "CSS", "JavaScript", "React", "React-bits", "Framer-Motion"],
    "pDec": "A modern, generic website template built using React for a component-based architecture. Framer Motion for smooth animations and transitions and React-bits for few animations.",
    "url":"#"
  },
  {
    "Name": "Function Modules",
    "img": "bg/img11.jpg",
    "Languages": ["JavaScript", "React"],
    "pDec": "A collection of reusable function modules and React components. Most components and modules are related to animations and transitions.",
    "url":"#"
  },
  {
    "Name": "My E-commerce Website",
    "img": "bg/img12.jpg",
    "Languages": ["Node.js", "Express", "MongoDB", "React"],
    "pDec": "Attempt at building a E-commerce Website. Ongoing",
    "url":"#"
  },
  {
    "Name": "Generic Dashboard",
    "img": "bg/img13.jpg",
    "Languages": ["HTML", "SASS", "JavaScript", "Chart.js"],
    "pDec": "A normal dashboard with charts and bulletin",
    "url":"#"
  },
  {
    "Name": "My Portfolio Website",
    "img": "bg/img14.jpg",
    "Languages": ["HTML", "CSS", "JavaScript", "GSAP"],
    "pDec": "A personal portfolio website showcasing projects and skills. Built with GSAP animations for smooth, engaging user interactions.",
    "url":"#"
  },
  {
    "Name": "My Blog",
    "img": "bg/img15.jpg",
    "Languages": ["HTML", "CSS", "JavaScript"],
    "pDec": "A simple blog platform with a modern, minimalist design. The front-end is built with pure HTML, CSS, and JavaScript, focusing on readability and a smooth user experience.",
    "url":"#"
  }
]

const bentoGrid = document.getElementById('bentoGrid');
const modal = document.getElementById('projectModal');
const modalTitle = document.getElementById('modalTitle');
const modalDescription = document.getElementById('modalDescription');
const modalLanguages = document.getElementById('modalLanguages');
const visitBtn = document.getElementById('visitBtn');
const closeModal = document.querySelector('.close');

// Large item positions (2x2 grid spans)
const largePositions = [0, 7, 10];

// Generate bento items
projects.forEach((project, index) => {
  const bentoItem = document.createElement('div');
  bentoItem.className = `bento-item ${largePositions.includes(index) ? 'large' : ''}`;
  bentoItem.style.backgroundImage = `url('${project.img}')`;
  
  const title = document.createElement('div');
  title.className = 'title';
  title.textContent = project.Name;
  
  bentoItem.appendChild(title);
  
  // Add click event for popup
  bentoItem.addEventListener('click', () => {
    modalTitle.textContent = project.Name;
    modalDescription.textContent = project.pDec;
    
    // Clear and populate languages
    modalLanguages.innerHTML = '';
    project.Languages.forEach(lang => {
      const langSpan = document.createElement('span');
      langSpan.textContent = lang;
      modalLanguages.appendChild(langSpan);
    });
    
    // Update visit button href
    if (visitBtn) {
      visitBtn.href = project.url;
    }
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Disable page scrolling
    isScrollDisabled = true;
  });
  
  bentoGrid.appendChild(bentoItem);
});

// Modal close functionality
function closeProjectModal() {
  modal.style.display = 'none';
  document.body.style.overflow = '';
  
  // Re-enable page scrolling
  isScrollDisabled = false;
}

closeModal.addEventListener('click', closeProjectModal);

window.addEventListener('click', (event) => {
  if (event.target === modal) {
    closeProjectModal();
  }
});

// Close modal with Escape key
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && modal.style.display === 'block') {
    closeProjectModal();
  }
});

// TESTIMONIALS SECTION: Manual slider with user controls
let currentTestimonyIndex = 0;

const testimony = [
  {
    "name": "Rambo Pattel",
    "comment": "I heard he was the one who created the unlimited ammo glitch.",
    "rating": 5,
    "img": "profiles/rambo.jpg"
  },
  {
    "name": "Optimus Lal",
    "comment": "I, Optimus Lal, recognise Mr.Developer's skill in upgrading my targetting system.",
    "rating": 4,
    "img": "profiles/prime.jpg"
  },
  {
    "name": "Ghengis Kumar",
    "comment": "My messengers worked tirelessly to send a Good Morning. Now I can send armies to those who dont reply back in a instant.",
    "rating": 5,
    "img": "profiles/khan.jpg"
  },
  {
    "name": "Hermione Granger",
    "comment": "Helped synthesize a new potion using AI. Now i can finally turn Ron back.",
    "rating": 5,
    "img": "profiles/emma.jpg"
  },
  {
    "name": "Daenerys Targaryen",
    "comment": "Implemented Dracarys function module. Before upgrades could be made, I was stabbed by my lover who became my brother.",
    "rating": 5,
    "img": "profiles/danny.jpg"
  },
  {
    "name": "John Snow",
    "comment": "Helped disable Death.exe",
    "rating": 5,
    "img": "profiles/snow.jpg"
  }
];

function createTestimonialCard(testimony) {
  if (!testimony || !testimony.name || !testimony.comment || !testimony.rating) {
    return '<div class="testimonial-card">Invalid testimonial data</div>';
  }
  
  const rating = Math.max(0, Math.min(5, testimony.rating));
  
  return `
    <div class="testimonial-card">
      <div class="testimonial-header">
        <img src="${encodeURI(testimony.img || '')}" alt="${testimony.name}" class="avatar-img" loading="lazy">
        <div class="info">
          <h4>${testimony.name}</h4>
        </div>
      </div>
      <p>"${testimony.comment}"</p>
      <div class="rating">
        <span>${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}</span>
      </div>
    </div>
  `;
}

function updateTestimonials() {
  const grid = document.getElementById('testimonialsGrid');
  if (!grid) return;
  
  const currentTestimonials = [];
  
  for (let i = 0; i < TESTIMONIALS_PER_PAGE; i++) {
    const index = (currentTestimonyIndex + i) % testimony.length;
    currentTestimonials.push(testimony[index]);
  }
  
  const tl = gsap.timeline();
  tl.to(grid, { opacity: 0, duration: 0.3 })
    .call(() => {
      grid.innerHTML = currentTestimonials.map(createTestimonialCard).join('');
    })
    .to(grid, { opacity: 1, duration: 0.3 });
}

function nextTestimonials() {
  currentTestimonyIndex = (currentTestimonyIndex + TESTIMONIALS_PER_PAGE) % testimony.length;
  updateTestimonials();
}

function prevTestimonials() {
  currentTestimonyIndex = (currentTestimonyIndex - TESTIMONIALS_PER_PAGE + testimony.length) % testimony.length;
  updateTestimonials();
}

function initTestimonialsControls() {
  const prevBtn = document.getElementById('testimonyPrevBtn');
  const nextBtn = document.getElementById('testimonyNextBtn');
  
  if (prevBtn) prevBtn.addEventListener('click', prevTestimonials);
  if (nextBtn) nextBtn.addEventListener('click', nextTestimonials);
}

function animateTestimonialsIn() {
  updateTestimonials();
  initTestimonialsControls();
}

// CONTACT SECTION: Animate contact elements
function animateContactIn() {
  const globe = document.querySelector('.slidingGlobe');
  const socialLinks = document.querySelectorAll('.social-link');
  
  gsap.to(socialLinks, { 
    y: 0, opacity: 1, filter: 'blur(0px)',
    duration: 0.6,
    ease: 'back.out(1.7)',
    stagger: 0.1
  });
  
  if (globe) {
    globeAnimation = gsap.to(globe, { 
      x: '42vw', opacity: 1, filter: 'blur(0px)',
      rotation: 0,
      duration: 1,
      ease: 'back.out(1.5)'
    });
  }
}

// ============================================================================
// INITIALIZATION & EVENT LISTENERS
// ============================================================================

// Loading page functionality
function hideLoadingPage() {
  const loadingPage = document.getElementById('loadingPage');
  const minDelay = 750;
  const animationDuration = 2000;
  const hideDelay = Math.max(minDelay, animationDuration);
  
  setTimeout(() => {
    loadingPage.classList.add('fade-out');
    setTimeout(() => {
      loadingPage.style.display = 'none';
    }, 500);
  }, hideDelay);
}

// ============================================================================
// MOBILE RESPONSIVE FUNCTIONS
// ============================================================================

// Mobile state variables
let isMobile = window.innerWidth <= 768;
let currentSlide = 0;

// Check if device is mobile
function checkMobile() {
  isMobile = window.innerWidth <= 768;
  updateLayoutForDevice();
}

// Update layout based on device
function updateLayoutForDevice() {
  if (isMobile) {
    initMobileFeatures();
  } else {
    removeMobileFeatures();
  }
}

// Initialize mobile-specific features
function initMobileFeatures() {
  const burgerMenu = document.getElementById('burgerMenu');
  if (burgerMenu) burgerMenu.style.display = 'flex';
  
  initBurgerMenu();
  initProjectsSlider();
}

// Remove mobile features for desktop
function removeMobileFeatures() {
  const burgerMenu = document.getElementById('burgerMenu');
  const navButtons = document.getElementById('navButtons');
  
  if (burgerMenu) burgerMenu.style.display = 'none';
  if (navButtons) {
    navButtons.classList.remove('active');
    navButtons.style.display = 'flex';
  }
}

// Burger menu functionality
function initBurgerMenu() {
  const burgerMenu = document.getElementById('burgerMenu');
  const navButtons = document.getElementById('navButtons');
  
  if (!burgerMenu || !navButtons) return;
  
  burgerMenu.addEventListener('click', () => {
    burgerMenu.classList.toggle('active');
    navButtons.classList.toggle('active');
  });
  
  // Close menu when clicking nav items
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (isMobile) {
        burgerMenu.classList.remove('active');
        navButtons.classList.remove('active');
      }
    });
  });
}



// Projects slider functionality
function initProjectsSlider() {
  if (!isMobile) return;
  
  const sliderContainer = document.getElementById('projectsSliderContainer');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  
  if (!sliderContainer || !prevBtn || !nextBtn) return;
  
  createMobileSlider();
  
  prevBtn.addEventListener('click', () => {
    if (currentSlide > 0) {
      currentSlide--;
      updateSlider();
    }
  });
  
  nextBtn.addEventListener('click', () => {
    if (currentSlide < projects.length - 1) {
      currentSlide++;
      updateSlider();
    }
  });
}

function createMobileSlider() {
  const sliderContainer = document.getElementById('projectsSliderContainer');
  const sliderDots = document.getElementById('sliderDots');
  
  if (!sliderContainer || !sliderDots || !projects.length) return;
  
  sliderContainer.innerHTML = '';
  sliderDots.innerHTML = '';
  
  projects.forEach((project, index) => {
    const slide = document.createElement('div');
    slide.className = 'project-slide';
    slide.style.backgroundImage = `url('${encodeURI(project.img)}')`;
    slide.innerHTML = `<div class="title">${project.Name}</div>`;
    slide.addEventListener('click', () => openProjectModal(project));
    sliderContainer.appendChild(slide);
    
    const dot = document.createElement('div');
    dot.className = `slider-dot ${index === 0 ? 'active' : ''}`;
    dot.addEventListener('click', () => {
      currentSlide = index;
      updateSlider();
    });
    sliderDots.appendChild(dot);
  });
}

function updateSlider() {
  const sliderContainer = document.getElementById('projectsSliderContainer');
  const dots = document.querySelectorAll('.slider-dot');
  
  if (!sliderContainer) return;
  const slideWidth = 0.84 * window.innerWidth;
  sliderContainer.style.transform = `translateX(-${currentSlide * slideWidth}px)`;
  
  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === currentSlide);
  });
}

function openProjectModal(project) {
  modalTitle.textContent = project.Name;
  modalDescription.textContent = project.pDec;
  
  modalLanguages.innerHTML = '';
  project.Languages.forEach(lang => {
    const langSpan = document.createElement('span');
    langSpan.textContent = lang;
    modalLanguages.appendChild(langSpan);
  });
  
  // Update visit button href
  if (visitBtn) {
    visitBtn.href = project.url;
  }
  
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';
  
  // Disable page scrolling
  isScrollDisabled = true;
}

// Particles system
function createParticles() {
  const container = document.getElementById('particles');
  const colors = ['#9333ea', '#ffffff'];
  
  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + 'vw';
    particle.style.top = Math.random() * 100 + 'vh';
    container.appendChild(particle);
    
    function twinkle() {
      const color = colors[Math.floor(Math.random() * colors.length)];
      gsap.to(particle, {
        backgroundColor: color,
        opacity: 1,
        scale: Math.random() * 2 + 1,
        duration: 0.2,
        ease: 'power2.out',
        onComplete: () => {
          gsap.to(particle, {
            opacity: 0,
            scale: 0,
            duration: 0.3,
            ease: 'power2.in'
          });
        }
      });
      
      setTimeout(twinkle, Math.random() * 5000 + 2000);
    }
    
    setTimeout(twinkle, Math.random() * 3000);
  }
}

// Initialize positions after DOM load
document.addEventListener('DOMContentLoaded', () => {
  hideLoadingPage();
  
  initPositions();
  updateNavButtons();
  updateIndicators();
  initializeSkills();
  createParticles();
  
  // Initialize mobile features
  checkMobile();

  // Set up event listeners
  addEventListener('wheel', onWheel, { passive: false });
  addEventListener('resize', () => {
    checkMobile();
    contents.forEach((el, i) => {
      if (i !== current) {
        const dir = sectionDirection(i);
        const off = offsetFor(dir);
        gsap.set(el, { x: off.x, y: off.y });
      }
    });
  });

  // Initialize animations for the first section
  if (sections[0].id === 'testimony') animateTestimonialsIn();
  if (sections[0].id === 'contact') animateContactIn();
});

