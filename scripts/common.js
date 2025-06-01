document.addEventListener('DOMContentLoaded', function () {
    let lenis = new Lenis({
        lerp: 0.05,
        wheelMultiplier: 1,
        touchMultiplier: 1
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    const swup = new Swup({
        containers: ['#swup'],
        linkSelector: 'a[href^="' + window.location.origin + '"]:not([data-no-swup]), a[href^="/"]:not([data-no-swup])',
        animateHistoryBrowse: true
    });

    swup.hooks.on('contentReplaced', function () {
        lenis.destroy();
        lenis = new Lenis({
            lerp: 0.05,
            wheelMultiplier: 1,
            touchMultiplier: 1
        });
        requestAnimationFrame(raf);

        applyIntersectionObserverForImages();
        setupCategoryToggle();
        // Swup으로 페이지 전환 후에도 활성 카테고리 로직을 재실행
        // 현재 페이지의 URL에 따라 활성 카테고리를 설정하는 로직이 필요하다면 여기에 추가
        // 예: highlightActiveCategoryBasedOnUrl();
    });

    function applyIntersectionObserverForImages() {
        const images = document.querySelectorAll('img[data-src]');

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '0px 0px 100px 0px'
        });

        images.forEach(img => {
            observer.observe(img);
        });
    }

    applyIntersectionObserverForImages();

    // LNB 카테고리 토글 기능 및 활성화 클래스 관리
    function setupCategoryToggle() {
        const categoryLinks = document.querySelectorAll('.navigation li[aria-haspopup="true"] > .category-toggle-link');
        const topLevelLinks = document.querySelectorAll('.navigation > ul > li:not([aria-haspopup="true"]) > a'); // 하위 메뉴 없는 최상위 링크

        // 모든 최상위 링크 (하위 메뉴 있는 것 + 없는 것)에 이벤트 리스너 연결
        const allTopLevelLinks = [...categoryLinks, ...topLevelLinks];

        allTopLevelLinks.forEach(link => {
            link.removeEventListener('click', handleCategoryClick); // 중복 등록 방지
            link.addEventListener('click', handleCategoryClick);
        });

        // 초기 로드 시 active-category 상태에 따라 서브메뉴 표시
        // (이전 HTML에서 TRAVEL이 active-category로 시작하도록 설정되어 있으므로 이 부분은 유지)
        document.querySelectorAll('.navigation li.active-category[aria-expanded="true"]').forEach(activeCategory => {
            const subCategory = activeCategory.querySelector('.sub-category');
            if (subCategory) {
                subCategory.setAttribute('aria-hidden', 'false');
            }
        });
    }

    function handleCategoryClick(event) {
        event.preventDefault(); // 링크의 기본 동작(페이지 이동) 방지

        const currentTargetLi = event.currentTarget.parentNode; // 클릭된 <a>의 부모 <li>

        // 모든 최상위 카테고리에서 active-category 클래스 제거
        document.querySelectorAll('.navigation > ul > li').forEach(li => {
            li.classList.remove('active-category');
            // 동시에 모든 펼쳐진 하위 메뉴 닫기 (토글 대상이 아닌 경우)
            if (li !== currentTargetLi && li.getAttribute('aria-haspopup') === 'true' && li.getAttribute('aria-expanded') === 'true') {
                li.setAttribute('aria-expanded', 'false');
                const sub = li.querySelector('.sub-category');
                if (sub) sub.setAttribute('aria-hidden', 'true');
            }
        });

        // 클릭된 <li>에 active-category 클래스 추가
        currentTargetLi.classList.add('active-category');

        // 만약 클릭된 <li>가 하위 메뉴를 가지고 있다면 토글 처리
        if (currentTargetLi.hasAttribute('aria-haspopup')) {
            const subCategory = currentTargetLi.querySelector('.sub-category');
            const isExpanded = currentTargetLi.getAttribute('aria-expanded') === 'true';

            // 토글 상태 변경
            currentTargetLi.setAttribute('aria-expanded', String(!isExpanded));
            if (subCategory) {
                subCategory.setAttribute('aria-hidden', String(isExpanded));
            }
        }
        
        // TODO: 실제 블로그 플랫폼에 적용 시, 클릭된 링크로 페이지 이동시키는 로직 추가
        // 예: window.location.href = event.currentTarget.href;
        // 다만, Swup을 사용한다면 Swup이 자동으로 처리할 것이므로 이 줄은 필요 없을 수 있습니다.
    }

    setupCategoryToggle();
});