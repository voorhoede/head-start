function openTargetedQuestion() {
  const { hash } = window.location;
  if (!hash) {
    return;
  }

  let target: Element | null;
  try {
    target = document.querySelector(hash);
  } catch {
    return;
  }

  if (target instanceof HTMLDetailsElement) {
    target.open = true;
    target.scrollIntoView();
  }
}

openTargetedQuestion();
window.addEventListener('hashchange', openTargetedQuestion);
