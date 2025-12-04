// Code with compatibility issues
const element = document.querySelector('.container');

// Using CSS Grid without fallback
element.style.display = 'grid';
element.style.gridTemplateColumns = 'repeat(auto-fit, minmax(300px, 1fr))';

// Using modern features without checking support
element.style.backdropFilter = 'blur(10px)';
element.style.scrollBehavior = 'smooth';

// Using eval (security risk)
const userCode = 'console.log("Hello")';
eval(userCode);

// Performance issues
for (let i = 0; i < 10000; i++) {
  document.querySelector('.item').style.display = 'none';
}