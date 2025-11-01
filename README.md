# Тестовое: Несколько слайдеров на Swiper

## Стек
- Vite
- Swiper.js (Navigation, Pagination, Keyboard, A11y, EffectCoverflow)
- Чистый CSS

## Критерии задания — выполнено
1. Все слайдеры на странице автоматически инициализируются (≥1200px).
2. При <1200px все слайдеры уничтожаются и показываются как статичный список (CSS-grid).
3. При возврате ≥1200px — повторная инициализация без дублей.
4. Защита от повторной init/destroy (WeakMap).
5. Адаптив 320px+, hover-эффекты, плавные анимации, lazy-fade изображений.

## Как запустить
```bash
npm i
npm run dev
# prod:
npm run build
npm run preview
