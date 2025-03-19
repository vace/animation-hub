# AnimationHub 🎨🌀
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
**CSS Animation Toolkit**

## Installation
```bash
# npm
npm install animation-hub

## Usage Examples 使用示例
### As CSS Library
```css
.btn-spin {
  @include animation-hub(spin, duration: 1.2s, easing: cubic-bezier(0.68, -0.55, 0.27, 1.55));
}
```

### As JSON API
```javascript
import animations from 'animation-hub/json';

const getBounceAnimations = () => 
  animations.filter(anim => anim.tags.includes('bounce'));
```

## Supported Libraries

| Library       | Version | Animation Count |
|---------------|---------|------------------|
| [animate.css](https://github.com/animate-css/animate.css)   | v4.1.1  | 106               |
| [animista](https://animista.net)      | -    | 662            |
| [magic](https://github.com/miniMAC/magic) | v1.4.8 | 60               |
| [loaders.css](https://github.com/ConnorAtherton/loaders.css/tree/master)   | v0.1.2  | 31               |
| [css-spinner](https://github.com/loadingio/css-spinner)   | v2.0.3  | 12               |

## License
Open-source under MIT License. Commercial usage allowed with attribution.
