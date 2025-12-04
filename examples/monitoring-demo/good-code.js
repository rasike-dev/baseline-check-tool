// Good, baseline-compatible code
const element = document.getElementById('app');
element.innerHTML = '<h1>Hello World</h1>';

// Using modern but well-supported features
const data = { name: 'John', age: 30 };
const { name, age } = data;

// CSS Grid with fallback
const gridStyle = `
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
`;

// Fallback for older browsers
if (!CSS.supports('display', 'grid')) {
  element.style.display = 'flex';
  element.style.flexWrap = 'wrap';
}