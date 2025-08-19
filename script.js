// ============================================================================
// GLOBAL STATE & CONTROL VARIABLES
// ============================================================================

// Core navigation state
const sections = Array.from(document.querySelectorAll('.panel'));
const contents = sections.map(s => s.querySelector('.content'));
let current = 0;
let isAnimating = false;

// Navigation elements
const navBtns = Array.from(document.querySelectorAll('.nav-btn'));
const sectionHeading = document.getElementById('sectionHeading');
const navButtons = document.getElementById('navButtons');

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

let originalPositions = new Map();

// Scroll control state
let isScrollDisabled = false;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Icon rendering - Initialize Feather icons
document.addEventListener('DOMContentLoaded', () => {
  if (window.feather) window.feather.replace();
});

// Sleep utility for typing animation
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ============================================================================
// Z-INDEX MANAGEMENT
// ============================================================================

// Controls section layering during transitions
function setActiveZIndex(index) {
  sections.forEach((section, i) => {
    section.style.zIndex = i === index ? '1000' : '1';
  });
}



// ============================================================================
// ELEMENT POSITION MANAGEMENT
// ============================================================================

// Animation control variables
const RANDOMIZE_SPREAD = 0.8;
const ROTATION_RANGE = 20;

function storeOriginalPositions() {
  contents.forEach(content => {
    const children = Array.from(content.children);
    originalPositions.set(content, children.map(child => ({
      element: child,
      x: 0,
      y: 0
    })));
  });
}

function randomizeElements(content) {
  const children = Array.from(content.children);
  const rect = content.getBoundingClientRect();
  
  children.forEach(child => {
    const randomX = (Math.random() - 0.5) * rect.width * RANDOMIZE_SPREAD;
    const randomY = (Math.random() - 0.5) * rect.height * RANDOMIZE_SPREAD;
    gsap.set(child, { x: randomX, y: randomY, rotation: Math.random() * ROTATION_RANGE - 10 });
  });
  
  const skillGrid = content.querySelector('.skill-grid');
  const socialLinks = content.querySelector('.social-grid');
  
  if (skillGrid) {
    const skills = Array.from(skillGrid.children);
    skills.forEach(skill => {
      const randomX = (Math.random() - 0.5) * 400;
      const randomY = (Math.random() - 0.5) * 300;
      gsap.set(skill, { x: randomX, y: randomY, rotation: Math.random() * 10 - 5 });
    });
  }
  
  if (socialLinks) {
    const links = Array.from(socialLinks.children);
    links.forEach(link => {
      const randomX = (Math.random() - 0.5) * 300;
      const randomY = (Math.random() - 0.5) * 200;
      gsap.set(link, { x: randomX, y: randomY, rotation: Math.random() * 15 - 7.5 });
    });
  }
}

function resetToOriginalPositions(content) {
  const children = Array.from(content.children);
  children.forEach(child => {
    gsap.set(child, { x: 0, y: 0, rotation: 0 });
  });
  
  const skillGrid = content.querySelector('.skill-grid');
  const socialLinks = content.querySelector('.social-grid');
  
  if (skillGrid) {
    Array.from(skillGrid.children).forEach(skill => {
      gsap.set(skill, { x: 0, y: 0, rotation: 0 });
    });
  }
  
  if (socialLinks) {
    Array.from(socialLinks.children).forEach(link => {
      gsap.set(link, { x: 0, y: 0, rotation: 0 });
    });
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
  const children = Array.from(content.children);
  const rect = content.getBoundingClientRect();
  const tl = gsap.timeline();
  
  tl.to(children, {
    x: () => (Math.random() - 0.5) * rect.width * RANDOMIZE_SPREAD,
    y: () => (Math.random() - 0.5) * rect.height * RANDOMIZE_SPREAD,
    rotation: () => Math.random() * ROTATION_RANGE - 10,
    duration: TRANSITION_DURATION,
    ease: 'power2.inOut',
    stagger: 0.05
  }, 0);
  
  const skillGrid = content.querySelector('.skill-grid');
  const socialLinks = content.querySelector('.social-grid');
  
  if (skillGrid) {
    const skills = Array.from(skillGrid.children);
    tl.to(skills, {
      x: () => (Math.random() - 0.5) * 400,
      y: () => (Math.random() - 0.5) * 300,
      rotation: () => Math.random() * 10 - 5,
      duration: TRANSITION_DURATION,
      ease: 'power2.inOut',
      stagger: 0.02
    }, 0);
  }
  
  if (socialLinks) {
    const links = Array.from(socialLinks.children);
    globeAnimation.reverse();
    tl.to(links, {
      x: () => (Math.random() - 0.5) * 300,
      y: () => (Math.random() - 0.5) * 200,
      rotation: () => Math.random() * 15 - 7.5,
      duration: TRANSITION_DURATION,
      ease: 'power2.inOut',
      stagger: 0.1
    }, 0);
  }
  
  return tl;
}

function animateChildrenToOriginal(content) {
  const children = Array.from(content.children);
  const tl = gsap.timeline();
  
  tl.to(children, {
    x: 0, y: 0, rotation: 0,
    duration: CHILD_ANIMATION_DURATION,
    ease: 'back.out(1.7)',
    stagger: 0.08
  }, 0);
  
  const skillGrid = content.querySelector('.skill-grid');
  const socialLinks = content.querySelector('.social-grid');
  
  if (skillGrid) {
    const skills = Array.from(skillGrid.children);
    tl.to(skills, {
      x: 0, y: 0, rotation: 0,
      duration: CHILD_ANIMATION_DURATION,
      ease: 'back.out(1.7)',
      stagger: 0.03
    }, 0.15);
  }
  
  if (socialLinks) {
    const links = Array.from(socialLinks.children);
    tl.to(links, {
      x: 0, y: 0, rotation: 0,
      duration: CHILD_ANIMATION_DURATION,
      ease: 'back.out(1.7)',
      stagger: 0.12
    }, 0.2);
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
      const prevSectionId = sections[current].id;
      current = target;
      isAnimating = false;
      updateNavButtons();

      // Stop animations from previous section
      if (prevSectionId === 'testimony') stopTestimonialsSlider();

      // Start animations for current section
      const currentSectionId = sections[current].id;
      if (currentSectionId === 'testimony') animateTestimonialsIn();
      if (currentSectionId === 'contact') animateContactIn();
    }
  });

  // Animation sequence: randomize → move sections → restore
  tl.add(animateChildrenToRandom(outEl), 0);
  tl.to(outEl, {
    x: outTo.x, y: outTo.y, opacity: 0, filter: 'blur(10px) contrast(0.9)',
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

function animateHeadingIn(newText) {
  sectionHeading.innerHTML = newText.split('').map(char => 
    char === ' ' ? '<span class="letter">&nbsp;</span>' : `<span class="letter">${char}</span>`
  ).join('');
  
  const newLetters = Array.from(sectionHeading.children);
  gsap.set(newLetters, { x: -100, opacity: 0 });
  
  gsap.to(newLetters, {
    x: 0,
    opacity: 1,
    duration: 0.4,
    stagger: 0.05,
    ease: 'back.out(1.7)'
  });
}

// Initialize heading with letters
function initHeading() {
  const myNameSpan = sectionHeading.querySelector('.myName');
  if (myNameSpan) {
    const text = myNameSpan.textContent;
    myNameSpan.innerHTML = text.split('').map(char => 
      char === ' ' ? '<span class="letter">&nbsp;</span>' : `<span class="letter">${char}</span>`
    ).join('');
  } else {
    const text = sectionHeading.textContent;
    sectionHeading.innerHTML = text.split('').map(char => 
      char === ' ' ? '<span class="letter">&nbsp;</span>' : `<span class="letter">${char}</span>`
    ).join('');
  }
}

// ============================================================================
// INPUT HANDLERS
// ============================================================================

// Mouse wheel navigation
function onWheel(e) {
  e.preventDefault();
  if (isAnimating || isScrollDisabled) {
    console.log('Scroll blocked:', { isAnimating, isScrollDisabled });
    return;
  }
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
navBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    if (isAnimating) return;
    const targetId = btn.dataset.section;
    const targetIndex = sections.findIndex(s => s.id === targetId);
    if (targetIndex !== current) {
      goToSection(targetIndex);
    }
  });
});

// ============================================================================
// SECTION-SPECIFIC ANIMATIONS
// ============================================================================

// HEADING SECTION: Name stroke and typing animation
gsap.to('.name-stroke', { strokeDashoffset: 0, duration: 7.5, ease: 'power3.out', delay: 0.3 });

// Typing animation control variables
const roles = ["Problem Solver", "Bored", "Tech Enthusiast", "Web Designer", "Human Male", "UI Designer", "Graduate"];
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

let activeSkill = null;
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
    
    activeSkill = s;
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

// PROJECTS SECTION




// PROJECTS SECTION: Generate bento grid
const projects = [
  {
    "Name": "Automated Speed Governor Using RFiD",
    "img": "bg/img1.jpg",
    "Languages": ["C++", "Arduino", "Embedded C"],
    "pDec": "Developed a prototype for an automated speed governor system using RFID technology. The system controls vehicle speed by reading data from RFID tags placed on the road, automatically adjusting the vehicle's speed to comply with posted limits."
  },
  {
    "Name": "3D Globe",
    "img": "bg/img2.jpg",
    "Languages": ["JavaScript", "WebGL", "Three.js"],
    "pDec": "Created an interactive 3D globe visualization. The project uses Three.js to render a rotatable sphere with dynamically loaded textures and interactive markers, showcasing real-time data or geographical information."
  },
  {
    "Name": "Kerala Tourism Website",
    "img": "bg/img3.jpg",
    "Languages": ["HTML", "CSS", "JavaScript", "PHP", "SQL", "jQuery"],
    "pDec": "Designed and developed a comprehensive tourism website for Kerala. The site features dynamic content management with PHP, a SQL database for storing tourist information, and an interactive front-end using JavaScript and jQuery to enhance user experience."
  },
  {
    "Name": "Dota 2 Website",
    "img": "bg/img4.jpg",
    "Languages": ["HTML", "CSS", "JavaScript"],
    "pDec": "A fan-made website for the popular game, Dota 2. The site features character information, game updates, and community guides, built with a focus on clean, responsive design using pure HTML, CSS, and JavaScript."
  },
  {
    "Name": "LED Backlighting System",
    "img": "bg/img5.jpg",
    "Languages": ["C++"],
    "pDec": "A custom backlighting system for monitors and TVs. The system uses a microcontroller to analyze screen colors and project synchronized ambient light, enhancing the viewing experience for movies and games."
  },
  {
    "Name": "Content Scrapper Extension",
    "img": "bg/img6.jpg",
    "Languages": ["JavaScript"],
    "pDec": "Built a browser extension that scrapes specific content from websites. The tool automates the extraction of data, and helps in collecting information from multiple web pages efficiently."
  },
  {
    "Name": "Graphic Designs",
    "img": "bg/img7.jpg",
    "Languages": ["Adobe Photoshop", "Adobe Illustrator"],
    "pDec": "A collection of graphic design work including logos, posters, and digital illustrations created for various clients and personal projects using Adobe Photoshop and Illustrator."
  },
  {
    "Name": "Photo Edits",
    "img": "bg/img8.jpg",
    "Languages": ["Adobe Photoshop"],
    "pDec": "A portfolio of photo editing and manipulation projects. These edits focus on color correction, retouching, and creating composite images to achieve a professional and artistic look."
  },
  {
    "Name": "Snake Game",
    "img": "bg/img9.jpg",
    "Languages": ["Javascript"],
    "pDec": "A classic Snake game created as a web-based application. The game features a dynamic grid, responsive controls, and score tracking, all built using vanilla JavaScript."
  },
  {
    "Name": "Generic Website",
    "img": "bg/img10.jpg",
    "Languages": ["HTML", "CSS", "JavaScript", "React", "React-bits", "Framer-Motion"],
    "pDec": "A modern, generic website template built using React for a component-based architecture. It incorporates Framer Motion for smooth animations and transitions, showcasing best practices in front-end development."
  },
  {
    "Name": "Function Modules",
    "img": "bg/img11.jpg",
    "Languages": ["JavaScript", "React"],
    "pDec": "A collection of reusable function modules and React components. These modules are designed to solve common programming problems and can be easily integrated into other projects to save development time."
  },
  {
    "Name": "E-commerce Website",
    "img": "bg/img12.jpg",
    "Languages": ["Node.js", "Express", "MongoDB", "React"],
    "pDec": "A full-stack e-commerce platform. The project features a REST API built with Node.js and Express, a MongoDB database for product and user data, and a dynamic front-end using React."
  },
  {
    "Name": "Dashboard",
    "img": "bg/img13.jpg",
    "Languages": ["HTML", "SASS", "JavaScript"],
    "pDec": "A data visualization dashboard. The interface is built with responsive HTML, styled with SASS, and uses JavaScript to fetch and display data in an intuitive and organized manner."
  },
  {
    "Name": "Portfolio Website",
    "img": "bg/img14.jpg",
    "Languages": ["HTML", "CSS", "JavaScript", "GSAP"],
    "pDec": "A personal portfolio website showcasing projects and skills. Built with modern web technologies and enhanced with GSAP animations for smooth, engaging user interactions."
  },
  {
    "Name": "Blog",
    "img": "bg/img15.jpg",
    "Languages": ["HTML", "CSS", "JavaScript"],
    "pDec": "A simple blog platform with a modern, minimalist design. The front-end is built with pure HTML, CSS, and JavaScript, focusing on readability and a smooth user experience."
  }
]

const bentoGrid = document.getElementById('bentoGrid');
const modal = document.getElementById('projectModal');
const modalTitle = document.getElementById('modalTitle');
const modalDescription = document.getElementById('modalDescription');
const modalLanguages = document.getElementById('modalLanguages');
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
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Disable page scrolling
    isScrollDisabled = true;
    console.log('Modal opened, scroll disabled:', isScrollDisabled);
  });
  
  bentoGrid.appendChild(bentoItem);
});

// Modal close functionality
function closeProjectModal() {
  modal.style.display = 'none';
  document.body.style.overflow = '';
  
  // Re-enable page scrolling
  isScrollDisabled = false;
  console.log('Modal closed, scroll enabled:', !isScrollDisabled);
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



// TESTIMONIALS SECTION: Slider with fade transitions
let testimonyInterval;
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
    "name": "Cleo Pathra",
    "comment": "Whoa! He made a 3D image of me...Or copied the code...Anyways",
    "rating": 5,
    "img": "profiles/cleo.jpg"
  },
  {
    "name": "John Wick",
    "comment": "Check it out, high table. My new profile pic is something to die for. Thanks.",
    "rating": 4,
    "img": "profiles/wick.jpg"
  },
  {
    "name": "Dimitri Kalashnikova ",
    "comment": "Code like Vodka, smooth.",
    "rating": 4,
    "img": "profiles/rus.jpg"
  },
  {
    "name": "Ghengis Kumar",
    "comment": "My messengers worked tirelessly to send a Good Morning. Now I can send armies to those who dont reply back in a instant.",
    "rating": 5,
    "img": "profiles/khan.jpg"
  },
  {
    "name": "Princess Peach",
    "comment": "Tracking system works. So now I can run away to a new castle much effectively.",
    "rating": 4,
    "img": "profiles/peach.jpg"
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
    "name": "Ellen Ripley",
    "comment": "While fighting the Alien, the Thoughts and Prayers sure did its job.",
    "rating": 4,
    "img": "profiles/ellen.jpg"
  },
  {
    "name": "Batman",
    "comment": "I AM BATMAN",
    "rating": 5,
    "img": "profiles/batman.jpg"
  },
  {
    "name": "John Snow",
    "comment": "Helped disable Death.exe",
    "rating": 5,
    "img": "profiles/snow.jpg"
  }
];

function createTestimonialCard(testimony) {
  return `
    <div class="testimonial-card">
      <div class="testimonial-header">
        <img src="${testimony.img}" alt="${testimony.name}" class="avatar-img" loading="lazy">
        <div class="info">
          <h4>${testimony.name}</h4>
        </div>
      </div>
      <p>"${testimony.comment}"</p>
      <div class="rating">
        <span>${'★'.repeat(testimony.rating)}${'☆'.repeat(5 - testimony.rating)}</span>
      </div>
    </div>
  `;
}

function updateTestimonials() {
  const grid = document.getElementById('testimonialsGrid');
  const currentTestimonials = [];
  
  for (let i = 0; i < 3; i++) {
    const index = (currentTestimonyIndex + i) % testimony.length;
    currentTestimonials.push(testimony[index]);
  }
  
  gsap.to(grid, {
    opacity: 0,
    duration: 0.5,
    onComplete: () => {
      grid.innerHTML = currentTestimonials.map(createTestimonialCard).join('');
      gsap.to(grid, { opacity: 1, duration: 0.5 });
    }
  });
  
  currentTestimonyIndex = (currentTestimonyIndex + 3) % testimony.length;
}

function startTestimonialsSlider() {
  updateTestimonials();
  testimonyInterval = setInterval(updateTestimonials, 4000);
}

function stopTestimonialsSlider() {
  if (testimonyInterval) {
    clearInterval(testimonyInterval);
    testimonyInterval = null;
  }
}

function animateTestimonialsIn() {
  startTestimonialsSlider();
}

// CONTACT SECTION: Animate contact elements
function animateContactIn() {
  const globe = document.querySelectorAll('.slidingGlobe')[0];
  console.log(globe);
  const socialLinks = document.querySelectorAll('.social-link');
  gsap.to(socialLinks, 
    { 
      y: 0, opacity: 1, filter: 'blur(0px)',
      duration: 0.6,
      ease: 'back.out(1.7)',
      stagger: 0.1
    }
  );
  globeAnimation = gsap.to(globe, 
    { 
      x: '42vw', opacity: 1, filter: 'blur(0px)',
      rotation: 0,
      duration: 1,
      ease: 'back.out(1.5)'
    }
  );
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
let projectsData = projects;

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
  initSkillsDropdown();
  initProjectsSlider();
}

// Remove mobile features for desktop
function removeMobileFeatures() {
  const burgerMenu = document.getElementById('burgerMenu');
  const navButtons = document.getElementById('navButtons');
  const skillsDropdownContent = document.getElementById('skillsDropdownContent');
  
  if (burgerMenu) burgerMenu.style.display = 'none';
  if (navButtons) {
    navButtons.classList.remove('active');
    navButtons.style.display = 'flex';
  }
  if (skillsDropdownContent) {
    skillsDropdownContent.classList.remove('active');
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

// Skills dropdown functionality
function initSkillsDropdown() {
  const skillsDropdownToggle = document.getElementById('skillsDropdownToggle');
  const skillsDropdownContent = document.getElementById('skillsDropdownContent');
  
  if (!skillsDropdownToggle || !skillsDropdownContent) return;
  
  skillsDropdownToggle.addEventListener('click', () => {
    skillsDropdownContent.classList.toggle('active');
    const arrow = skillsDropdownToggle.querySelector('span:last-child');
    arrow.textContent = skillsDropdownContent.classList.contains('active') ? '▲' : '▼';
    
    // Control page scrolling
    isScrollDisabled = skillsDropdownContent.classList.contains('active');
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.skills-dropdown')) {
      skillsDropdownContent.classList.remove('active');
      const arrow = skillsDropdownToggle.querySelector('span:last-child');
      if (arrow) arrow.textContent = '▼';
      
      // Re-enable page scrolling
      isScrollDisabled = false;
    }
  });
  
  // Update dropdown toggle text when skill is selected
  const skillButtons = skillGrid.querySelectorAll('button');
  skillButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const skillName = btn.textContent.trim();
      const toggleText = skillsDropdownToggle.querySelector('span:first-child');
      toggleText.textContent = skillName;
      skillsDropdownContent.classList.remove('active');
      const arrow = skillsDropdownToggle.querySelector('span:last-child');
      arrow.textContent = '▼';
      
      // Re-enable page scrolling
      isScrollDisabled = false;
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
    if (currentSlide < projectsData.length - 1) {
      currentSlide++;
      updateSlider();
    }
  });
}

function createMobileSlider() {
  const sliderContainer = document.getElementById('projectsSliderContainer');
  const sliderDots = document.getElementById('sliderDots');
  
  if (!sliderContainer || !projectsData.length) return;
  
  sliderContainer.innerHTML = '';
  sliderDots.innerHTML = '';
  
  projectsData.forEach((project, index) => {
    const slide = document.createElement('div');
    slide.className = 'project-slide';
    slide.style.backgroundImage = `url('${project.img}')`;
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
  
  const slideWidth = 460;
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
  
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';
  
  // Disable page scrolling
  isScrollDisabled = true;
  console.log('Modal opened (mobile), scroll disabled:', isScrollDisabled);
}

// Initialize positions after DOM load
document.addEventListener('DOMContentLoaded', () => {
  hideLoadingPage();
  
  storeOriginalPositions();
  initPositions();
  initHeading();
  updateNavButtons();
  initializeSkills();
  
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
  if (sections[0].id === 'projects') startProjectsAnimation();
  if (sections[0].id === 'testimony') animateTestimonialsIn();
  if (sections[0].id === 'contact') animateContactIn();
});

