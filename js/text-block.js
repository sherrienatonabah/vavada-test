function initializeToggle(e){
    let{
        blockSelector:t,
        buttonSelector:l,
        hiddenTextSelector:o,
        arrowIconSelector:s,
        rotateClass:i,
        dotsClass:c,
        offset:n}=e;
        function a(e){
            let l=e.querySelector(o),a=e.querySelector(".show-text"),r=e.querySelector(".hide-text"),d=e.querySelector(s),b=e.closest(t),u=c?e.querySelector(c.visibleTextSelector):null,f=l.classList.contains(c?c.hiddenClass:"flex-display");if(l.classList.toggle(c?c.hiddenClass:"flex-display"),a.style.display=f?"block":"none",r.style.display=f?"none":"block",d.classList.toggle(i),c&&u&&(f?u.classList.add(c.dotsVisibleClass):u.classList.remove(c.dotsVisibleClass)),b.id){let h=window.location.pathname+window.location.search+(f?"":"#"+b.id);window.history.replaceState(null,"",h)}f&&setTimeout(()=>{let e=b.getBoundingClientRect().top+window.pageYOffset-n;window.scrollTo({top:e,behavior:"smooth"})},100)}document.addEventListener("click",function(e){let t=e.target.closest(l);t&&a(t.parentNode)}),document.addEventListener("click",function(e){let l=e.target.closest('a[href^="#"]');if(l){let s=l.getAttribute("href"),i=document.querySelector(s);if(i){let r=i.closest(t),d=!1;if(r){let b=r.querySelector(o);b&&!b.classList.contains(c?c.hiddenClass:"flex-display")&&(a(r),d=!0)}e.preventDefault();let u=i.getBoundingClientRect().top+window.pageYOffset-n;window.scrollTo({top:u,behavior:"smooth"}),d?window.history.replaceState(null,"",s):window.history.pushState(null,"",s)}}})}initializeToggle({blockSelector:".text-block",buttonSelector:".text-block-button",hiddenTextSelector:".text-block-content-hidden",arrowIconSelector:".text-block-button img",rotateClass:"rotate-180",offset:64}),initializeToggle({blockSelector:".text-block__content",buttonSelector:".text-block__content-button",hiddenTextSelector:".text-block__content-hidden",arrowIconSelector:".text-block__content-button img",rotateClass:"rotate--90",dotsClass:{visibleTextSelector:".text-block-second-content-visible",dotsVisibleClass:"text-block-second-content-dots",hiddenClass:"inline-display"},offset:64});
