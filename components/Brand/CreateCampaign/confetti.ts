
export const showConfetti = () => {
  // Simple confetti effect using CSS animation
  const confetti = document.createElement('div');
  confetti.innerHTML = '🎉🎊✨🎉🎊✨🎉🎊✨';
  confetti.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 3rem;
    z-index: 10000;
    animation: confetti 2s ease-out forwards;
    pointer-events: none;
  `;
  
  // Add CSS animation if not already added
  if (!document.getElementById('confetti-style')) {
    const style = document.createElement('style');
    style.id = 'confetti-style';
    style.textContent = `
      @keyframes confetti {
        0% {
          opacity: 1;
          transform: translate(-50%, -50%) scale(0.5);
        }
        50% {
          transform: translate(-50%, -50%) scale(1.2);
        }
        100% {
          opacity: 0;
          transform: translate(-50%, -50%) scale(1) translateY(-100px);
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(confetti);
  setTimeout(() => {
    confetti.remove();
  }, 2000);
};
