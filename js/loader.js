(function() {
    'use strict';

    // ====== КОНФИГУРАЦИЯ ======
    const CONFIG_URL = 'https://cdn.jsdelivr.net/gh/yourusername/vavada-casino-cdn@main/config.json';
    const TIMEOUT = 15000; // 15 секунд
    const RETRY_ATTEMPTS = 3;
    
    // ====== ОСНОВНОЙ КЛАСС ======
    class SiteLoader {
        constructor() {
            this.config = null;
            this.loadedBlocks = 0;
            this.totalBlocks = 0;
            this.startTime = Date.now();
            
            // DOM элементы
            this.loaderEl = document.getElementById('siteLoader');
            this.loaderText = document.getElementById('loaderText');
            this.loaderStatus = document.getElementById('loaderStatus');
            this.appEl = document.getElementById('app');
        }

        // ====== ИНИЦИАЛИЗАЦИЯ ======
        async init() {
            try {
                // 1. Загружаем конфигурацию
                this.updateStatus('Загрузка конфигурации...');
                this.config = await this.fetchWithRetry(CONFIG_URL);
                
                // 2. Загружаем шрифты
                this.updateStatus('Загрузка шрифтов...');
                this.loadFonts();
                
                // 3. Загружаем стили
                this.updateStatus('Загрузка стилей...');
                await this.loadStyles();
                
                // 4. Загружаем блоки
                this.updateStatus('Загрузка контента...');
                await this.loadBlocks();
                
                // 5. Загружаем скрипты
                this.updateStatus('Загрузка скриптов...');
                await this.loadScripts();
                
                // 6. Инициализируем
                this.updateStatus('Инициализация...');
                await this.initializeSite();
                
                // 7. Показываем сайт
                this.updateStatus('Готово!');
                this.showSite();
                
            } catch (error) {
                console.error('❌ Ошибка загрузки сайта:', error);
                this.showError(error);
            }
        }

        // ====== FETCH С RETRY ======
        async fetchWithRetry(url, attempts = RETRY_ATTEMPTS) {
            for (let i = 0; i < attempts; i++) {
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
                    
                    const response = await fetch(url, { 
                        signal: controller.signal,
                        cache: 'no-cache'
                    });
                    
                    clearTimeout(timeoutId);
                    
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}`);
                    }
                    
                    const contentType = response.headers.get('content-type');
                    if (contentType?.includes('application/json')) {
                        return await response.json();
                    }
                    return await response.text();
                    
                } catch (error) {
                    if (i === attempts - 1) throw error;
                    console.warn(`⚠️ Попытка ${i + 1} не удалась, повтор...`);
                    await this.sleep(1000 * (i + 1));
                }
            }
        }

        // ====== ЗАГРУЗКА ШРИФТОВ ======
        loadFonts() {
            if (!this.config.fonts) return;
            
            const style = document.createElement('style');
            let css = '';
            
            this.config.fonts.forEach(font => {
                css += `
                    @font-face {
                        font-family: '${font.name}';
                        src: url('${this.config.cdn}${font.src}') format('truetype');
                        font-weight: ${font.weight || 'normal'};
                        font-style: ${font.style || 'normal'};
                        font-display: swap;
                    }
                `;
            });
            
            style.textContent = css;
            document.head.appendChild(style);
            
            console.log('✅ Шрифты загружены');
        }

        // ====== ЗАГРУЗКА СТИЛЕЙ ======
        async loadStyles() {
            const styles = this.config.styles || [];
            
            const promises = styles.map(styleFile => {
                return new Promise((resolve, reject) => {
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = this.config.cdn + styleFile;
                    link.onload = () => {
                        console.log(`✅ Стиль загружен: ${styleFile}`);
                        resolve();
                    };
                    link.onerror = () => reject(new Error(`Ошибка загрузки ${styleFile}`));
                    document.head.appendChild(link);
                });
            });

            await Promise.all(promises);
            console.log('✅ Все стили загружены');
        }

        // ====== ЗАГРУЗКА БЛОКОВ ======
        async loadBlocks() {
            const layout = this.config.layout || [];
            this.totalBlocks = layout.length;

            const promises = layout.map(async (blockName) => {
                try {
                    const blockPath = this.config.blocks[blockName];
                    if (!blockPath) {
                        console.warn(`⚠️ Блок "${blockName}" не найден`);
                        return;
                    }

                    const blockUrl = this.config.cdn + blockPath;
                    const html = await this.fetchWithRetry(blockUrl);
                    
                    const containerId = `app-${blockName}`;
                    const container = document.getElementById(containerId);
                    
                    if (container) {
                        container.innerHTML = html;
                        console.log(`✅ Блок загружен: ${blockName}`);
                    } else {
                        console.warn(`⚠️ Контейнер #${containerId} не найден`);
                    }
                    
                    this.loadedBlocks++;
                    this.updateProgress();
                    
                } catch (error) {
                    console.error(`❌ Ошибка загрузки блока "${blockName}":`, error);
                }
            });

            await Promise.all(promises);
            console.log('✅ Все блоки загружены');
        }

        // ====== ЗАГРУЗКА СКРИПТОВ ======
        async loadScripts() {
            const scripts = this.config.scripts || [];
            
            // Загружаем последовательно для сохранения порядка
            for (const scriptFile of scripts) {
                try {
                    await new Promise((resolve, reject) => {
                        const script = document.createElement('script');
                        script.src = this.config.cdn + scriptFile;
                        script.onload = () => {
                            console.log(`✅ Скрипт загружен: ${scriptFile}`);
                            resolve();
                        };
                        script.onerror = () => reject(new Error(`Ошибка загрузки ${scriptFile}`));
                        document.body.appendChild(script);
                    });
                } catch (error) {
                    console.error(`❌ Ошибка загрузки скрипта "${scriptFile}":`, error);
                }
            }
            
            console.log('✅ Все скрипты загружены');
        }

        // ====== ИНИЦИАЛИЗАЦИЯ САЙТА ======
        async initializeSite() {
            // Даём время на выполнение скриптов
            await this.sleep(200);

            // Инициализация различных модулей
            const initFunctions = [
                'initHeader',
                'initAccordion',
                'initSwiper',
                'initLang',
                'initDrawer',
                'initArticles',
                'initTextBlock',
                'initTextDefence'
            ];

            initFunctions.forEach(funcName => {
                if (typeof window[funcName] === 'function') {
                    try {
                        window[funcName]();
                        console.log(`✅ ${funcName} выполнен`);
                    } catch (error) {
                        console.error(`❌ Ошибка в ${funcName}:`, error);
                    }
                }
            });

            // Настройка редиректов
            this.setupRedirects();
            
            // Lazy loading изображений
            this.setupLazyLoading();

            console.log('✅ Сайт инициализирован');
        }

        // ====== РЕДИРЕКТЫ ======
        setupRedirects() {
            const redirectUrl = this.config.redirectUrl || '/gotosite.html';

            // Все ссылки (кроме якорных)
            document.querySelectorAll('a').forEach(link => {
                const href = link.getAttribute('href');
                if (!href || href.startsWith('#') || href.startsWith('http')) return;
                
                // Не трогаем ссылки с data-no-redirect
                if (link.hasAttribute('data-no-redirect')) return;
                
                link.href = redirectUrl;
            });

            // Все кнопки (кроме с data-no-redirect)
            document.addEventListener('click', (e) => {
                const button = e.target.closest('button');
                if (button && !button.hasAttribute('data-no-redirect')) {
                    e.preventDefault();
                    window.location.href = redirectUrl;
                }
            });

            console.log('✅ Редиректы настроены');
        }

        // ====== LAZY LOADING ======
        setupLazyLoading() {
            const images = document.querySelectorAll('img[loading="lazy"]');
            
            if ('IntersectionObserver' in window) {
                const imageObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            if (img.dataset.src) {
                                img.src = img.dataset.src;
                                img.removeAttribute('data-src');
                            }
                            imageObserver.unobserve(img);
                        }
                    });
                });

                images.forEach(img => imageObserver.observe(img));
                console.log(`✅ Lazy loading для ${images.length} изображений`);
            }
        }

        // ====== ОБНОВЛЕНИЕ UI ======
        updateProgress() {
            const progress = Math.round((this.loadedBlocks / this.totalBlocks) * 100);
            if (this.loaderText) {
                this.loaderText.textContent = `Загрузка... ${progress}%`;
            }
        }

        updateStatus(status) {
            if (this.loaderStatus) {
                this.loaderStatus.textContent = status;
            }
            console.log(`📍 ${status}`);
        }

        // ====== ПОКАЗ САЙТА ======
        showSite() {
            const loadTime = ((Date.now() - this.startTime) / 1000).toFixed(2);
            console.log(`🎉 Сайт загружен за ${loadTime}с`);

            setTimeout(() => {
                this.loaderEl.classList.add('hidden');
                this.appEl.classList.add('visible');
                
                setTimeout(() => {
                    this.loaderEl.remove();
                }, 500);
            }, 300);
        }

        // ====== ПОКАЗ ОШИБКИ ======
        showError(error) {
            this.loaderEl.innerHTML = `
                <div style="text-align: center; max-width: 500px; padding: 0 20px;">
                    <h2 style="color: #ff4444; margin-bottom: 20px; font-size: 24px;">
                        ⚠️ Ошибка загрузки
                    </h2>
                    <p style="color: rgba(255,255,255,0.7); margin-bottom: 20px; line-height: 1.6;">
                        Не удалось загрузить сайт. Проверьте подключение к интернету и попробуйте снова.
                    </p>
                    <p style="font-size: 12px; color: rgba(255,255,255,0.4); margin-bottom: 30px;">
                        ${error.message || 'Неизвестная ошибка'}
                    </p>
                    <button onclick="location.reload()" style="
                        background: linear-gradient(135deg, #00d4ff 0%, #0099ff 100%);
                        border: none;
                        padding: 14px 32px;
                        color: white;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 16px;
                        font-weight: 600;
                        transition: transform 0.2s;
                    ">
                        🔄 Обновить страницу
                    </button>
                </div>
            `;
        }

        // ====== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ======
        sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
    }

    // ====== ЗАПУСК ======
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            const loader = new SiteLoader();
            loader.init();
        });
    } else {
        const loader = new SiteLoader();
        loader.init();
    }

})();