document.addEventListener("DOMContentLoaded", () => {
    const navbar = document.getElementById("navbar");
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) navbar.classList.add("nav-scroll");
        else navbar.classList.remove("nav-scroll");
    });

    const body = document.body;
    const toastIndex = document.getElementById('toastIndex');
    const toastText = document.getElementById('toastText');

    // Overlay utama (bukan overlay milik profile/auth yang dikelola sendiri)
    const toggleOverlay = (show) => {
        const mainOverlay = document.querySelector('.overlay:not(#profileOverlay):not(#authOverlay)');
        if (mainOverlay) {
            if (show) mainOverlay.classList.add('active');
            else mainOverlay.classList.remove('active');
        }
        body.style.overflow = show ? 'hidden' : 'auto';
    };

    const showToast = (message) => {
        if (!toastIndex || !toastText) return;
        toastText.innerText = message;
        toastIndex.classList.remove('opacity-0', 'translate-y-8');
        toastIndex.classList.add('opacity-100', 'translate-y-0');
        setTimeout(() => {
            toastIndex.classList.remove('opacity-100', 'translate-y-0');
            toastIndex.classList.add('opacity-0', 'translate-y-8');
        }, 3000);
    };

    const formatRupiah = (angka) => "Rp " + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    // ================================
    // MENU MOBILE
    // ================================
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    if (hamburgerBtn && mobileMenu) {
        hamburgerBtn.addEventListener('click', () => mobileMenu.classList.toggle('active'));
        mobileMenu.querySelectorAll('a').forEach(a =>
            a.addEventListener('click', () => mobileMenu.classList.remove('active'))
        );
    }

    // ================================
    // SEARCH BAR
    // ================================
    const searchBtn = document.getElementById('searchBtn');
    const searchBar = document.getElementById('searchBar');
    const closeSearchBar = document.getElementById('closeSearchBar');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');

    if (searchBtn) searchBtn.addEventListener('click', () => {
        searchBar.classList.add('active');
        setTimeout(() => { if (searchInput) searchInput.focus(); }, 300);
    });
    if (closeSearchBar) closeSearchBar.addEventListener('click', () => {
        searchBar.classList.remove('active');
        searchInput.value = '';
        searchResults.innerHTML = '';
        searchResults.classList.add('hidden');
    });

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            searchResults.innerHTML = '';
            if (query.length === 0) {
                searchResults.classList.add('hidden');
                return;
            }
            searchResults.classList.remove('hidden');

            const products = Array.from(document.querySelectorAll('.product-card')).map(card => ({
                title: card.querySelector('.product-title').innerText,
                img: card.querySelector('.product-img').src,
                price: card.querySelector('.price-now').innerText
            }));

            const filtered = products.filter(p => p.title.toLowerCase().includes(query));

            if (filtered.length === 0) {
                searchResults.innerHTML = '<p class="text-center text-sm text-gray-500 py-4">Produk tidak ditemukan.</p>';
            } else {
                filtered.forEach(p => {
                    searchResults.innerHTML += `
                        <div class="flex items-center gap-3 p-2 hover:bg-[#F8F2ED] rounded-xl cursor-pointer" onclick="document.getElementById('searchBar').classList.remove('active'); document.getElementById('produk').scrollIntoView({behavior:'smooth'})">
                            <img src="${p.img}" class="w-10 h-10 rounded-lg object-cover" alt="${p.title}">
                            <div>
                                <h4 class="text-sm font-medium text-[#8A624F]">${p.title}</h4>
                                <p class="text-xs text-gray-500">${p.price}</p>
                            </div>
                        </div>
                    `;
                });
            }
        });
    }

    // ================================
    // AUTH & PROFILE SYSTEM
    // ================================
    let registeredUsers = [];
    let currentUser = null;

    const authTrigger = document.getElementById('authTrigger');
    const authModal = document.getElementById('authModal');
    const closeAuthModal = document.getElementById('closeAuthModal');
    const authOverlay = document.getElementById('authOverlay');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const showSignup = document.getElementById('showSignup');
    const showLogin = document.getElementById('showLogin');

    const profilePanel = document.getElementById('profilePanel');
    const profileOverlay = document.getElementById('profileOverlay');
    const closeProfilePanel = document.getElementById('closeProfilePanel');
    const profileAvatar = document.getElementById('profileAvatar');
    const uploadAvatar = document.getElementById('uploadAvatar');
    const profileNameDisplay = document.getElementById('profileNameDisplay');
    const profileEmailDisplay = document.getElementById('profileEmailDisplay');
    const profileNameInput = document.getElementById('profileNameInput');
    const profileEmailInput = document.getElementById('profileEmailInput');
    const profilePhoneInput = document.getElementById('profilePhoneInput');
    const profileForm = document.getElementById('profileForm');
    const logoutBtn = document.getElementById('logoutBtn');

    const openAuthModal = () => { authModal.classList.add('active'); authOverlay.classList.add('active'); document.body.style.overflow = 'hidden'; };
    const closeAuthModalFn = () => { authModal.classList.remove('active'); authOverlay.classList.remove('active'); document.body.style.overflow = 'auto'; };

    const openProfilePanel = () => { profilePanel.classList.add('active'); profileOverlay.classList.add('active'); document.body.style.overflow = 'hidden'; };
    const closeProfilePanelFn = () => { profilePanel.classList.remove('active'); profileOverlay.classList.remove('active'); document.body.style.overflow = 'auto'; };

    const updateAuthUI = () => {
        if (currentUser) {
            profileAvatar.src = currentUser.avatar || 'https://via.placeholder.com/100/FDF1EE/9E6B55?text=Z';
            profileNameDisplay.innerText = currentUser.name;
            profileEmailDisplay.innerText = currentUser.email;
            profileNameInput.value = currentUser.name;
            profileEmailInput.value = currentUser.email;
            profilePhoneInput.value = currentUser.phone || '';
        }
    };

    authTrigger.addEventListener('click', () => {
        if (currentUser) openProfilePanel();
        else openAuthModal();
    });

    if (showSignup) showSignup.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
        document.getElementById('loginError').classList.add('hidden');
    });
    if (showLogin) showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        signupForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        document.getElementById('signupError').classList.add('hidden');
    });

    if (closeAuthModal) closeAuthModal.addEventListener('click', closeAuthModalFn);
    if (authOverlay) authOverlay.addEventListener('click', closeAuthModalFn);
    if (closeProfilePanel) closeProfilePanel.addEventListener('click', closeProfilePanelFn);
    if (profileOverlay) profileOverlay.addEventListener('click', closeProfilePanelFn);

    document.getElementById('loginSubmit').addEventListener('click', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const errorEl = document.getElementById('loginError');

        const user = registeredUsers.find(u => u.email === email && u.password === password);

        if (user) {
            currentUser = user;
            errorEl.classList.add('hidden');
            closeAuthModalFn();
            showToast(`Selamat datang kembali, ${currentUser.name.split(' ')[0]}!`);
            updateAuthUI();
        } else {
            errorEl.classList.remove('hidden');
        }
    });

    document.getElementById('signupSubmit').addEventListener('click', (e) => {
        e.preventDefault();
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const errorEl = document.getElementById('signupError');

        const exists = registeredUsers.find(u => u.email === email);
        if (exists) {
            errorEl.classList.remove('hidden');
            return;
        }

        const newUser = { name, email, password, phone: '', avatar: 'https://via.placeholder.com/100/FDF1EE/9E6B55?text=Z' };
        registeredUsers.push(newUser);
        currentUser = newUser;

        errorEl.classList.add('hidden');
        closeAuthModalFn();
        showToast(`Pendaftaran berhasil! Selamat datang, ${name.split(' ')[0]}.`);
        updateAuthUI();
    });

    if (uploadAvatar) uploadAvatar.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                profileAvatar.src = event.target.result;
                if (currentUser) currentUser.avatar = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    if (profileForm) profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (currentUser) {
            currentUser.name = profileNameInput.value;
            currentUser.phone = profilePhoneInput.value;
            updateAuthUI();
            showToast("Profil berhasil diperbarui!");
        }
    });

    if (logoutBtn) logoutBtn.addEventListener('click', () => {
        currentUser = null;
        closeProfilePanelFn();
        showToast("Anda telah keluar.");
        updateAuthUI();
    });

    // ================================
    // CART PANEL + BADGE ANGKA TROLI
    // ================================
    let cart = [];
    const navCartBtn = document.getElementById('navCartBtn');
    const footerCartLink = document.getElementById('footerCartLink');
    const cartPanel = document.getElementById('cartPanel');
    const closeCartPanel = document.getElementById('closeCartPanel');
    const closeCartEmpty = document.getElementById('closeCartEmpty');
    const cartBadge = document.getElementById('cartBadge');

    const updateCartBadge = () => {
        if (!cartBadge) return;
        const totalQty = cart.reduce((n, i) => n + i.qty, 0);
        cartBadge.innerText = totalQty;
        if (totalQty > 0) cartBadge.classList.remove('hidden');
        else cartBadge.classList.add('hidden');
    };

    const openCartPanel = () => { if (cartPanel) cartPanel.classList.add('active'); toggleOverlay(true); };
    const closeCartPanelFn = () => { if (cartPanel) cartPanel.classList.remove('active'); toggleOverlay(false); };

    if (navCartBtn) navCartBtn.addEventListener('click', openCartPanel);
    if (footerCartLink) footerCartLink.addEventListener('click', (e) => { e.preventDefault(); openCartPanel(); });
    if (closeCartPanel) closeCartPanel.addEventListener('click', closeCartPanelFn);
    if (closeCartEmpty) closeCartEmpty.addEventListener('click', closeCartPanelFn);

    const addToCart = (product) => {
        const existing = cart.find(item => item.title === product.title);
        if (existing) existing.qty += product.qty;
        else cart.push(product);
        renderCart();
        updateCartBadge();
    };

    const renderCart = () => {
        const container = document.getElementById('cartItemsContainer');
        const emptyState = document.getElementById('cartEmpty');
        const footer = document.getElementById('cartFooter');
        if (!container || !emptyState || !footer) return;

        if (cart.length === 0) {
            container.classList.add('hidden');
            emptyState.classList.remove('hidden');
            footer.classList.add('hidden');
        } else {
            container.classList.remove('hidden');
            emptyState.classList.add('hidden');
            footer.classList.remove('hidden');
            container.innerHTML = cart.map((item, index) => `
                <div class="cart-item flex gap-4 bg-[#F7F1EC] p-3 rounded-xl border border-[#EFE1D8]">
                    <img src="${item.imgSrc}" class="w-20 h-20 rounded-lg object-cover" alt="${item.title}">
                    <div class="flex-1 flex flex-col justify-between">
                        <div>
                            <h3 class="font-semibold text-sm text-[#8B5E4C] leading-tight">${item.title}</h3>
                            <p class="text-xs text-gray-500 mt-1">${item.color || 'Standar'}</p>
                        </div>
                        <div class="flex justify-between items-center mt-2">
                            <div class="flex items-center gap-2 bg-white rounded-full px-2 py-1 border border-gray-100">
                                <button onclick="changeQty(${index}, -1)" class="text-gray-400 hover:text-[#8E5D4D] text-sm font-bold w-4">-</button>
                                <span class="text-xs font-medium text-[#8B5E4C]">${item.qty}</span>
                                <button onclick="changeQty(${index}, 1)" class="text-gray-400 hover:text-[#8E5D4D] text-sm font-bold w-4">+</button>
                            </div>
                            <p class="font-semibold text-sm text-[#B67A60]">${formatRupiah(item.price * item.qty)}</p>
                        </div>
                    </div>
                    <button onclick="removeItem(${index})" class="text-gray-300 hover:text-red-400 transition self-start text-lg">&times;</button>
                </div>
            `).join('');
            updateTotal();
        }
    };

    window.changeQty = (index, delta) => {
        cart[index].qty += delta;
        if (cart[index].qty < 1) cart[index].qty = 1;
        renderCart();
        updateCartBadge();
    };

    window.removeItem = (index) => {
        cart.splice(index, 1);
        renderCart();
        updateCartBadge();
    };

    const updateTotal = () => {
        let total = 0;
        cart.forEach(item => total += (item.price * item.qty));
        const totalEl = document.getElementById('cartTotal');
        if (totalEl) totalEl.innerText = formatRupiah(total);
    };

    const deleteAllBtn = document.getElementById('deleteAllBtn');
    if (deleteAllBtn) deleteAllBtn.addEventListener('click', () => {
        cart = [];
        renderCart();
        updateCartBadge();
        showToast("Keranjang dikosongkan");
    });

    document.querySelectorAll('.overlay').forEach(overlay => {
        overlay.addEventListener('click', () => {
            if (cartPanel) cartPanel.classList.remove('active');
            if (detailModal) detailModal.classList.remove('active');
            toggleOverlay(false);
        });
    });

    // ================================
    // DETAIL PRODUK
    // ================================
    const productCards = document.querySelectorAll(".product-card");
    const detailModal = document.getElementById("detailModal");
    const closeDetailModal = document.getElementById("closeDetailModal");
    const categoryNames = { 'pashmina': 'Pashmina', 'square': 'Square', 'bergo': 'Bergo', 'inner': 'Inner' };

    if (detailModal) {
        const openDetail = () => { detailModal.classList.add('active'); toggleOverlay(true); };
        const closeDetail = () => { detailModal.classList.remove('active'); toggleOverlay(false); };

        if (closeDetailModal) closeDetailModal.addEventListener('click', closeDetail);

        const plus = document.getElementById('plus');
        const minus = document.getElementById('minus');
        const qtyEl = document.getElementById('qty');
        let count = 1;

        if (plus && minus && qtyEl) {
            plus.addEventListener('click', () => { count++; qtyEl.innerText = count; });
            minus.addEventListener('click', () => { if (count > 1) { count--; qtyEl.innerText = count; } });
        }

        productCards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.quick-cart')) {
                    e.stopPropagation();
                    const imgSrc = card.querySelector('.product-img').src;
                    const title = card.querySelector('.product-title').innerText;
                    const priceText = card.querySelector('.price-now').innerText;
                    const price = parseInt(priceText.replace(/[^0-9]/g, ''));
                    addToCart({ imgSrc, title, price, color: 'Warna Standar', qty: 1 });
                    showToast("Ditambahkan ke Keranjang!");
                    return;
                }

                const imgSrc = card.querySelector('.product-img').src;
                const title = card.querySelector('.product-title').innerText;
                const priceText = card.querySelector('.price-now').innerText;
                const category = card.getAttribute('data-category');
                const discEl = card.querySelector('.badge-disc');
                const bestEl = card.querySelector('.badge-best');
                const cardColors = card.querySelectorAll('.color');

                document.getElementById('productImage').src = imgSrc;
                document.getElementById('modalTitle').innerText = title;
                document.getElementById('price').innerText = priceText;
                document.getElementById('modalCategory').innerText = categoryNames[category] || category;

                const modalBadge = document.getElementById('modalBadge');
                if (discEl) {
                    modalBadge.innerText = discEl.innerText;
                    modalBadge.className = 'modal-badge';
                } else if (bestEl) {
                    modalBadge.innerText = bestEl.innerText;
                    modalBadge.className = 'modal-badge';
                } else {
                    modalBadge.className = 'modal-badge hidden';
                }

                const modalColors = document.querySelectorAll('.detail-color');
                modalColors.forEach((mColor, index) => {
                    if (cardColors[index]) {
                        mColor.style.background = cardColors[index].style.background;
                        mColor.classList.remove('active');
                        if (index === 0) mColor.classList.add('active');
                        mColor.style.display = 'block';
                    } else {
                        mColor.style.display = 'none';
                    }
                });

                count = 1;
                qtyEl.innerText = '1';
                openDetail();
            });
        });

        const detailColors = document.querySelectorAll('.detail-color');
        detailColors.forEach(color => {
            color.addEventListener('click', () => {
                detailColors.forEach(c => c.classList.remove('active'));
                color.classList.add('active');
            });
        });

        const cartBtnModal = document.getElementById('cartBtn');
        const buyBtnModal = document.getElementById('buyBtn');
        const handleModalAddToCart = (isBuyNow = false) => {
            const imgSrc = document.getElementById('productImage').src;
            const title = document.getElementById('modalTitle').innerText;
            const priceText = document.getElementById('price').innerText;
            const price = parseInt(priceText.replace(/[^0-9]/g, ''));
            const qtyVal = parseInt(document.getElementById('qty').innerText);
            addToCart({ imgSrc, title, price, color: 'Warna Pilihan', qty: qtyVal });
            closeDetail();
            if (isBuyNow) {
                openCheckout();
            } else {
                showToast("Ditambahkan ke Keranjang!");
                setTimeout(openCartPanel, 300);
            }
        };
        if (cartBtnModal) cartBtnModal.addEventListener('click', () => handleModalAddToCart(false));
        if (buyBtnModal) buyBtnModal.addEventListener('click', () => handleModalAddToCart(true));
    }

    // ================================
    // PROMO
    // ================================
    const promoProduct = {
        imgSrc: 'assets/s2.jpg',
        title: 'Zhaff Paris Japan',
        price: 38000,
        color: 'Promo Spesial',
        qty: 1
    };

    const promoCartBtn = document.getElementById('promoCartBtn');
    if (promoCartBtn) promoCartBtn.addEventListener('click', () => {
        addToCart(promoProduct);
        showToast("Ditambahkan ke Keranjang!");
        openCartPanel();
    });

    // ================================
    // FILTER
    // ================================
    const filters = document.querySelectorAll(".filter-btn");
    const applyFilter = (filterValue) => {
        productCards.forEach(card => {
            if (card.getAttribute("data-category") === filterValue) {
                card.classList.remove("hide-card");
            } else {
                card.classList.add("hide-card");
            }
        });
    };
    filters.forEach(btn => {
        btn.onclick = () => {
            filters.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            applyFilter(btn.getAttribute("data-filter"));
        };
    });
    const activeBtn = document.querySelector(".filter-btn.active");
    if (activeBtn) applyFilter(activeBtn.getAttribute("data-filter"));

    // ================================
    // COUNTER
    // ================================
    const counters = document.querySelectorAll(".counter");
    let started = false;
    const startCounter = () => {
        counters.forEach(counter => {
            const target = counter.getAttribute("data-target");
            const suffix = counter.getAttribute("data-suffix") || "";
            if (target.includes(".")) animateDecimal(counter, parseFloat(target), suffix);
            else animateNumber(counter, parseInt(target), suffix);
        });
    };
    function animateNumber(element, target, suffix) {
        let count = 0;
        const step = Math.max(1, Math.ceil(target / 40));
        const timer = setInterval(() => {
            count += step;
            if (count >= target) { count = target; clearInterval(timer); }
            element.innerHTML = count + suffix;
        }, 30);
    }
    function animateDecimal(element, target, suffix) {
        let count = 0;
        const timer = setInterval(() => {
            count += 0.1;
            if (count >= target) { count = target; clearInterval(timer); }
            element.innerHTML = count.toFixed(1) + suffix;
        }, 40);
    }
    window.addEventListener("scroll", () => {
        const section = document.querySelector(".counter");
        if (!section) return;
        const trigger = section.getBoundingClientRect().top;
        if (trigger < window.innerHeight - 100 && !started) {
            startCounter();
            started = true;
        }
    });

    // ================================
    // FADE UP
    // ================================
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add("show");
        });
    }, { threshold: 0.15 });
    document.querySelectorAll(".fade-up, .category-card").forEach(el => {
        el.classList.add("fade-up");
        observer.observe(el);
    });

    // ================================
    // 3D TILT + KLIK KATEGORI
    // ================================
    const catCards = document.querySelectorAll(".category-card");
    catCards.forEach(card => {
        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.transform = `perspective(1000px) rotateX(${-(y - rect.height / 2) / 40}deg) rotateY(${(x - rect.width / 2) / 40}deg) translateY(-6px)`;
        });
        card.addEventListener("mouseleave", () => {
            card.style.transform = "perspective(1000px) rotateX(0) rotateY(0) translateY(0)";
        });
        card.addEventListener("click", () => {
            const f = card.getAttribute("data-filter");
            const btn = f && document.querySelector(`.filter-btn[data-filter="${f}"]`);
            if (btn) btn.click();
            const sec = document.getElementById('produk');
            if (sec) sec.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // ================================
    // CONTACT FORM
    // ================================
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            showToast("Pesan terkirim! Kami akan membalas via email, mohon ditunggu.");
            contactForm.reset();
        });
    }

    // ================================
    // SMOOTH SCROLL
    // ================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", function (e) {
            const targetId = this.getAttribute("href");
            if (targetId === "#") return;
            e.preventDefault();
            const target = document.querySelector(targetId);
            if (target) target.scrollIntoView({ behavior: "smooth" });
        });
    });

    // ================================
    // SCROLL TO TOP
    // ================================
    const topBtn = document.createElement("button");
    topBtn.innerHTML = "↑";
    topBtn.className = "fixed bottom-6 right-6 bg-[#9E6B55] hover:bg-[#8A5A45] text-white w-10 h-10 rounded-full hidden shadow-lg z-40 text-base transition duration-300";
    document.body.appendChild(topBtn);
    window.addEventListener("scroll", () => {
        if (window.scrollY > 400) topBtn.classList.remove("hidden");
        else topBtn.classList.add("hidden");
    });
    topBtn.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });

    // ================================
    // TAHUN FOOTER
    // ================================
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.innerText = new Date().getFullYear();

    // ================================
    // HALAMAN PESANAN — FULLSCREEN
    // ================================
    let orders = [];

    const orderBtn = document.getElementById('orderBtn');
    const navOrderBtn = document.getElementById('navOrderBtn');
    const orderPanel = document.getElementById('orderPanel');
    const orderCloseBtn = document.getElementById('orderCloseBtn');
    const emptyOrder = document.getElementById('emptyOrder');
    const orderList = document.getElementById('orderList');
    const orderShopBtn = document.getElementById('orderShopBtn');
    const orderDetailModal = document.getElementById('orderDetailModal');
    const orderDetailCloseBtn = document.getElementById('orderDetailCloseBtn');

    const renderOrder = () => {
        if (!orderPanel || !emptyOrder || !orderList) return;

        if (orders.length > 0) {
            emptyOrder.style.display = 'none';
            orderList.style.display = 'block';

            orderList.innerHTML = orders.map((o, i) => `
                <div class="order-card">
                    <p class="order-number">${o.number}</p>
                    <div class="order-line"></div>
                    <div class="order-card-content">
                        <div class="product-image">
                            <img src="${o.items[0].imgSrc}" alt="${o.items[0].title}" />
                        </div>
                        <div class="order-product-info">
                            <h3>${o.items[0].title}${o.items.length > 1 ? ` +${o.items.length - 1} produk lainnya` : ''}</h3>
                            <p>★ 4.9</p>
                            <strong>${formatRupiah(o.total)}</strong>
                        </div>
                    </div>
                    <button class="detail-btn-panel" data-order="${i}">Lihat Detail</button>
                </div>
            `).join('');

            orderList.querySelectorAll('.detail-btn-panel').forEach(btn => {
                btn.addEventListener('click', () => openOrderDetail(parseInt(btn.dataset.order)));
            });
        } else {
            emptyOrder.style.display = 'flex';
            orderList.style.display = 'none';
        }
    };
    renderOrder();

    const openOrderPanel = () => {
        if (orderPanel) orderPanel.classList.add('active');
        document.body.style.overflow = 'hidden';
    };
    const closeOrderPanelFn = () => {
        if (orderPanel) orderPanel.classList.remove('active');
        document.body.style.overflow = 'auto';
    };

    if (navOrderBtn) navOrderBtn.addEventListener('click', openOrderPanel);
    if (orderBtn) orderBtn.addEventListener('click', (e) => { e.preventDefault(); openOrderPanel(); });
    if (orderCloseBtn) orderCloseBtn.addEventListener('click', closeOrderPanelFn);

    if (orderShopBtn) orderShopBtn.addEventListener('click', () => {
        closeOrderPanelFn();
        const sec = document.getElementById('produk');
        if (sec) sec.scrollIntoView({ behavior: 'smooth' });
    });

    const openOrderDetail = (index) => {
        const o = orders[index];
        if (!o || !orderDetailModal) return;
        const numEl = document.getElementById('orderDetailNumber');
        const infoEl = document.getElementById('orderDetailInfo');
        const addrEl = document.getElementById('orderDetailAddress');
        const addrDetailEl = document.getElementById('orderDetailAddressDetail');
        if (numEl) numEl.innerText = o.number;
        if (infoEl) infoEl.innerText = `${o.date} • ${o.items.map(i => `${i.title} × ${i.qty}`).join(', ')} • ${formatRupiah(o.total)}`;
        if (addrEl && o.address) addrEl.innerText = `${o.address.nama} — ${o.address.telpon}`;
        if (addrDetailEl && o.address) addrDetailEl.innerText = `${o.address.alamat}, ${o.address.kota}, ${o.address.kecamatan} ${o.address.kodePos}`;
        orderDetailModal.classList.add('active');
    };
    const closeOrderDetail = () => { if (orderDetailModal) orderDetailModal.classList.remove('active'); };

    if (orderDetailCloseBtn) orderDetailCloseBtn.addEventListener('click', closeOrderDetail);
    if (orderDetailModal) orderDetailModal.addEventListener('click', (e) => {
        if (e.target === orderDetailModal) closeOrderDetail();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeOrderDetail();
    });

    // ================================
    // CHECKOUT SYSTEM (3 LANGKAH)
    // ================================
    const checkoutPage = document.getElementById('checkoutPage');
    const checkoutBackBtn = document.getElementById('checkoutBackBtn');
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');
    const step1Indicator = document.getElementById('step1Indicator');
    const step2Indicator = document.getElementById('step2Indicator');
    const step3Indicator = document.getElementById('step3Indicator');
    const continueBtn = document.getElementById('continueBtn');
    const payBtn = document.getElementById('payBtn');
    const successOrderDetailBtn = document.getElementById('successOrderDetailBtn');
    const shopAgainBtn = document.getElementById('shopAgainBtn');

    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) return;
            closeCartPanelFn();
            openCheckout();
        });
    }

    let checkoutItems = [];
    let productTotal = 0;
    let checkoutCompleted = false;
    let selectedShipping = { name: 'JNE Reguler', price: 10000 };
    let selectedPayment = 'Transfer BCA';
    let previousPayment = 'Transfer BCA';

    const showStep = (num) => {
        [step1, step2, step3].forEach(s => s && s.classList.remove('active-step'));
        [step1Indicator, step2Indicator, step3Indicator].forEach(s => s && s.classList.remove('active', 'completed'));
        if (num === 1) { step1.classList.add('active-step'); step1Indicator.classList.add('active'); }
        if (num === 2) { step2.classList.add('active-step'); step1Indicator.classList.add('completed'); step2Indicator.classList.add('active'); }
        if (num === 3) {
            step3.classList.add('active-step');
            step1Indicator.classList.add('completed');
            step2Indicator.classList.add('completed');
            step3Indicator.classList.add('active');
            updateSummary();
        }
    };

    const openCheckout = () => {
        if (!checkoutPage) return;
        checkoutItems = cart.map(i => ({ ...i }));
        productTotal = checkoutItems.reduce((n, i) => n + i.price * i.qty, 0);
        checkoutCompleted = false;
        showStep(1);
        checkoutPage.classList.add('active');
        checkoutPage.scrollTop = 0;
        document.body.style.overflow = 'hidden';

        setTimeout(() => {
            initCheckoutMap();
            if (checkoutMap) checkoutMap.invalidateSize();
        }, 400);
    };

    const closeCheckout = () => {
        if (checkoutPage) checkoutPage.classList.remove('active');
        document.body.style.overflow = 'auto';
    };

    if (checkoutBackBtn) checkoutBackBtn.addEventListener('click', () => {
        if (step2.classList.contains('active-step')) showStep(1);
        else if (step3.classList.contains('active-step')) showStep(2);
        else closeCheckout();
    });

    if (continueBtn) continueBtn.addEventListener('click', () => {
        const nama = document.getElementById('namaPenerima').value.trim();
        const telpon = document.getElementById('noTelpon').value.trim();
        const alamat = document.getElementById('alamat').value.trim();
        if (nama === '' || telpon === '' || alamat === '') {
            showToast('Mohon lengkapi data penerima terlebih dahulu.');
            return;
        }
        showStep(2);
    });

    // ---- Pengiriman (ongkir ikut jarak) ----
    const shippingCards = document.querySelectorAll('.shipping-card');
    shippingCards.forEach(card => {
        card.addEventListener('click', () => {
            shippingCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            const isExpress = card.querySelector('strong').textContent.includes('Express');
            const ongkir = ongkirNow();
            selectedShipping = {
                name: isExpress ? 'JNE Express' : 'JNE Reguler',
                price: isExpress ? ongkir.express : ongkir.reguler
            };
        });
    });

    // ---- Metode pembayaran: klik → pilih + buka detail (kecuali COD) ----
    const paymentItems = document.querySelectorAll('.payment-item');
    paymentItems.forEach(item => {
        item.addEventListener('click', () => {
            paymentItems.forEach(p => p.classList.remove('selected-payment'));
            item.classList.add('selected-payment');
            const method = item.querySelector('strong').textContent.trim();
            previousPayment = selectedPayment; // simpan pilihan lama (untuk batal)
            selectedPayment = method;
            if (!method.includes('COD')) openPaymentModal(method);
        });
    });

    const updateSummary = () => {
        const el = (id) => document.getElementById(id);
        const total = productTotal + selectedShipping.price;
        if (el('totalBayar')) el('totalBayar').textContent = formatRupiah(total);
        if (el('metodeBayar')) el('metodeBayar').textContent = selectedPayment;
        if (el('kurirPengiriman')) el('kurirPengiriman').textContent = selectedShipping.name;
        if (el('orderIdText') && orders.length) el('orderIdText').textContent = orders[orders.length - 1].number;
        const estDays = selectedShipping.name.includes('Express') ? 1 : 3;
        const tiba = new Date();
        tiba.setDate(tiba.getDate() + estDays);
        if (el('estimasiTiba')) el('estimasiTiba').textContent = tiba.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
    };

    const completeCheckout = () => {
        if (!checkoutCompleted) {
            const total = productTotal + selectedShipping.price;
            orders.push({
                number: '#ZS-' + Date.now().toString().slice(-6),
                items: checkoutItems.map(i => ({ ...i })),
                total: total,
                date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
                address: {
                    nama: document.getElementById('namaPenerima').value,
                    telpon: document.getElementById('noTelpon').value,
                    alamat: document.getElementById('alamat').value,
                    kota: document.getElementById('kota').value,
                    kecamatan: document.getElementById('kecamatan').value,
                    kodePos: document.getElementById('kodePos').value,
                    lokasi: savedAddressName
                }
            });
            renderOrder();
            cart = [];
            renderCart();
            updateCartBadge();
            checkoutCompleted = true;
            showToast('Pesanan berhasil dibuat!');
        }
        showStep(3);
    };

    // "Bayar sekarang" → SELALU lanjut ke step 3
    // (metode sudah dikonfirmasi lewat modal "Lanjutkan Checkout")
    if (payBtn) payBtn.addEventListener('click', () => {
        completeCheckout();
    });

    if (successOrderDetailBtn) successOrderDetailBtn.addEventListener('click', () => {
        closeCheckout();
        openOrderPanel();
    });
    if (shopAgainBtn) shopAgainBtn.addEventListener('click', () => {
        closeCheckout();
        const sec = document.getElementById('produk');
        if (sec) sec.scrollIntoView({ behavior: 'smooth' });
    });

    // ================================
    // PAYMENT MODAL (BCA / BNI / QRIS)
    // ================================
    const paymentModal = document.getElementById('paymentModal');
    const paymentClose = document.getElementById('paymentClose');
    const paymentModalTitle = document.getElementById('paymentModalTitle');
    const bcaPayment = document.getElementById('bcaPayment');
    const bniPayment = document.getElementById('bniPayment');
    const qrisPayment = document.getElementById('qrisPayment');

    const generateQRCode = () => {
        const qrContainer = document.getElementById('qrcode');
        if (!qrContainer || typeof QRCode === 'undefined') return;
        qrContainer.innerHTML = '';
        new QRCode(qrContainer, {
            text: `https://zhaffscarf.com/payment?total=${productTotal + selectedShipping.price}`,
            width: 96, height: 96,
            colorDark: '#000000', colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });
    };

    const openPaymentModal = (method) => {
        if (!paymentModal) return;
        paymentModal.classList.add('active');
        [bcaPayment, bniPayment, qrisPayment].forEach(c => c && c.classList.remove('active-payment'));

        document.querySelectorAll('.pay-dynamic-total').forEach(el => {
            el.textContent = formatRupiah(productTotal + selectedShipping.price);
        });

        if (method === 'Transfer BCA') { paymentModalTitle.textContent = '| Transfer BCA'; bcaPayment.classList.add('active-payment'); }
        else if (method === 'Transfer BNI') { paymentModalTitle.textContent = '| Transfer BNI'; bniPayment.classList.add('active-payment'); }
        else if (method === 'QRIS') { paymentModalTitle.textContent = '| QRIS'; qrisPayment.classList.add('active-payment'); generateQRCode(); }
    };

    // confirmed = true  → metode dikonfirmasi
    // confirmed = false → tutup tanpa konfirmasi → kembalikan pilihan sebelumnya
    const closePaymentModal = (confirmed = false) => {
        if (paymentModal) paymentModal.classList.remove('active');
        if (!confirmed) {
            selectedPayment = previousPayment;
            paymentItems.forEach(p => {
                const name = p.querySelector('strong').textContent.trim();
                p.classList.toggle('selected-payment', name === selectedPayment);
            });
        }
    };

    if (paymentClose) paymentClose.addEventListener('click', () => closePaymentModal(false));
    if (paymentModal) paymentModal.addEventListener('click', (e) => {
        if (e.target === paymentModal) closePaymentModal(false);
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && paymentModal && paymentModal.classList.contains('active')) closePaymentModal(false);
    });

    // Salin rekening
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (navigator.clipboard) navigator.clipboard.writeText(btn.dataset.copy).catch(() => {});
            showToast('Nomor rekening disalin!');
        });
    });

    // "Lanjutkan Checkout" → konfirmasi metode
    document.querySelectorAll('.use-method-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            selectedPayment = btn.dataset.method;
            paymentItems.forEach(p => {
                const name = p.querySelector('strong').textContent.trim();
                p.classList.toggle('selected-payment', name === selectedPayment);
            });
            closePaymentModal(true);
            showToast(`Metode: ${selectedPayment} ✓ — klik "Bayar sekarang"`);
        });
    });

    // ================================
    // PETA ALA SHOPEE (pin tetap di tengah)
    // ================================
    // Referensi toko DISIMPAN DI SINI (tidak tampil di peta) — hanya untuk hitung ongkir
    // GANTI dengan koordinat toko aslimu (Google Maps → klik kanan → copy koordinat)
    const STORE_LOC = { lat: -6.914744, lng: 107.609811 };

    let checkoutMap = null;
    let currentDistanceKm = null;
    let savedAddressName = '';
    let geocodeTimer = null;
    let searchTimer = null;

    // Tier ongkir berdasarkan jarak — sesuaikan dengan daerahmu
    // contoh: Sumedang Selatan (±35 km) → Reguler 10.000, Express 20.000
    const calcOngkir = (km) => {
        if (km < 50)  return { reguler: 10000, express: 20000 };
        if (km < 100) return { reguler: 15000, express: 25000 };
        if (km < 200) return { reguler: 25000, express: 35000 };
        return { reguler: 35000, express: 45000 };
    };

    const ongkirNow = () =>
        currentDistanceKm !== null ? calcOngkir(currentDistanceKm) : { reguler: 10000, express: 20000 };

    const haversineKm = (a, b) => {
        const R = 6371;
        const dLat = (b.lat - a.lat) * Math.PI / 180;
        const dLng = (b.lng - a.lng) * Math.PI / 180;
        const h = Math.sin(dLat / 2) ** 2 +
                  Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) *
                  Math.sin(dLng / 2) ** 2;
        return 2 * R * Math.asin(Math.sqrt(h));
    };

    const updateOngkirUI = () => {
        const ongkir = calcOngkir(currentDistanceKm);
        const pr = document.getElementById('priceReguler');
        const pe = document.getElementById('priceExpress');
        if (pr) pr.innerText = formatRupiah(ongkir.reguler);
        if (pe) pe.innerText = formatRupiah(ongkir.express);

        const activeCard = document.querySelector('.shipping-card.selected');
        if (activeCard) {
            const isExpress = activeCard.querySelector('strong').textContent.includes('Express');
            selectedShipping = {
                name: isExpress ? 'JNE Express' : 'JNE Reguler',
                price: isExpress ? ongkir.express : ongkir.reguler
            };
        }
    };

    // Alamat terdeteksi otomatis dari posisi pin (Nominatim — gratis, tanpa API key)
    const reverseGeocode = async (lat, lng) => {
        const el = document.getElementById('mapAddrName');
        if (!el) return;
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=id`);
            const data = await res.json();
            savedAddressName = data.display_name || 'Lokasi terpilih';
        } catch (e) {
            savedAddressName = 'Lokasi terpilih';
        }
        el.innerText = savedAddressName;
    };

    const onMapMoved = () => {
        if (!checkoutMap) return;
        const c = checkoutMap.getCenter();
        currentDistanceKm = haversineKm(STORE_LOC, { lat: c.lat, lng: c.lng });
        updateOngkirUI();
        clearTimeout(geocodeTimer);
        geocodeTimer = setTimeout(() => reverseGeocode(c.lat, c.lng), 600);
    };

    const initCheckoutMap = () => {
        if (checkoutMap || typeof L === 'undefined') return;
        const el = document.getElementById('mapPick');
        if (!el) return;

        checkoutMap = L.map(el).setView([-6.87, 107.59], 13);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; CARTO',
            maxZoom: 19
        }).addTo(checkoutMap);

        checkoutMap.on('moveend', onMapMoved);
        checkoutMap.on('click', () => {
            const r = document.getElementById('mapSearchResults');
            if (r) r.classList.add('hidden');
        });
        setTimeout(onMapMoved, 300);
    };

    // ---- Pencarian alamat ----
    const mapSearch = document.getElementById('mapSearch');
    const mapSearchResults = document.getElementById('mapSearchResults');
    if (mapSearch && mapSearchResults) {
        mapSearch.addEventListener('input', () => {
            clearTimeout(searchTimer);
            const q = mapSearch.value.trim();
            if (q.length < 3) { mapSearchResults.classList.add('hidden'); return; }
            searchTimer = setTimeout(async () => {
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=5&accept-language=id&q=${encodeURIComponent(q)}`);
                    const data = await res.json();
                    if (!data.length) {
                        mapSearchResults.innerHTML = '<div class="map-result-item">Lokasi tidak ditemukan.</div>';
                    } else {
                        mapSearchResults.innerHTML = data.map(d =>
                            `<div class="map-result-item" data-lat="${d.lat}" data-lon="${d.lon}">${d.display_name}</div>`
                        ).join('');
                    }
                    mapSearchResults.classList.remove('hidden');
                } catch (e) { /* diamkan */ }
            }, 500);
        });

        mapSearchResults.addEventListener('click', (e) => {
            const item = e.target.closest('.map-result-item');
            if (!item || !item.dataset.lat) return;
            if (checkoutMap) checkoutMap.flyTo([parseFloat(item.dataset.lat), parseFloat(item.dataset.lon)], 16);
            mapSearchResults.classList.add('hidden');
        });

        mapSearch.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') mapSearchResults.classList.add('hidden');
        });
    }

    // ================================
    // LOADING ANIMATION
    // ================================
    body.style.opacity = "0";
    body.style.transition = "opacity 0.8s ease";
    window.addEventListener("load", () => body.style.opacity = "1");
});