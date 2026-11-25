/**
 * B3 Tecnologias — interações da landing page.
 */
(function () {
	'use strict';

	var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	var finePointer = window.matchMedia('(pointer: fine)').matches;

	// Header: estado ao rolar.
	var header = document.querySelector('[data-header]');
	if (header) {
		var onScroll = function () {
			header.classList.toggle('is-scrolled', window.scrollY > 20);
		};
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
	}

	// Menu mobile.
	var toggle = document.querySelector('[data-nav-toggle]');
	var nav = document.querySelector('[data-nav]');
	if (toggle && nav) {
		var setOpen = function (open) {
			document.body.classList.toggle('nav-open', open);
			toggle.setAttribute('aria-expanded', String(open));
		};
		toggle.addEventListener('click', function () {
			setOpen(!document.body.classList.contains('nav-open'));
		});
		nav.addEventListener('click', function (e) {
			if (e.target.closest('a')) setOpen(false);
		});
		document.addEventListener('keydown', function (e) {
			if (e.key === 'Escape') setOpen(false);
		});
	}

	// Contador animado.
	var animateCount = function (el) {
		var target = parseInt(el.getAttribute('data-count'), 10);
		var suffix = el.getAttribute('data-suffix') || '';
		if (reduceMotion || isNaN(target)) return;
		var start = null;
		var duration = 1400;
		var step = function (ts) {
			if (!start) start = ts;
			var p = Math.min((ts - start) / duration, 1);
			var eased = 1 - Math.pow(1 - p, 3);
			el.textContent = Math.round(target * eased) + suffix;
			if (p < 1) requestAnimationFrame(step);
		};
		requestAnimationFrame(step);
	};

	// Terminal com efeito de digitação (linha a linha).
	var typeTerminal = function (pre) {
		var code = pre.querySelector('code');
		if (!code || reduceMotion) return;
		var lines = code.innerHTML.split('\n');
		code.innerHTML = '';
		var caret = document.createElement('span');
		caret.className = 'caret';
		var i = 0;
		var next = function () {
			if (i >= lines.length) {
				code.appendChild(caret);
				return;
			}
			var line = document.createElement('span');
			line.innerHTML = lines[i] + (i < lines.length - 1 ? '\n' : '');
			code.appendChild(line);
			code.appendChild(caret);
			i++;
			setTimeout(next, i === 1 ? 700 : 380);
		};
		next();
	};

	// Revelação ao rolar.
	var revealTargets = document.querySelectorAll('.reveal, [data-count], [data-typer]');
	if ('IntersectionObserver' in window) {
		var io = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (!entry.isIntersecting) return;
				var el = entry.target;
				el.classList.add('is-visible');
				if (el.hasAttribute('data-count')) animateCount(el);
				if (el.hasAttribute('data-typer')) typeTerminal(el);
				io.unobserve(el);
			});
		}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

		// Escalonamento automático entre irmãos.
		document.querySelectorAll('.bento, .steps, .timeline, .features, .faq__list').forEach(function (group) {
			Array.prototype.forEach.call(group.children, function (child, idx) {
				if (!child.style.getPropertyValue('--d')) child.style.setProperty('--d', idx % 4);
			});
		});

		revealTargets.forEach(function (el) { io.observe(el); });
	} else {
		revealTargets.forEach(function (el) { el.classList.add('is-visible'); });
	}

	if (!finePointer || reduceMotion) return;

	// Spotlight que segue o cursor nos cards.
	document.querySelectorAll('[data-spotlight]').forEach(function (card) {
		card.addEventListener('pointermove', function (e) {
			var r = card.getBoundingClientRect();
			card.style.setProperty('--x', (e.clientX - r.left) + 'px');
			card.style.setProperty('--y', (e.clientY - r.top) + 'px');
		});
	});

	// Tilt 3D no painel do hero.
	var tilt = document.querySelector('[data-tilt]');
	if (tilt) {
		var area = tilt.closest('.hero') || tilt;
		area.addEventListener('pointermove', function (e) {
			var r = tilt.getBoundingClientRect();
			var x = (e.clientX - (r.left + r.width / 2)) / r.width;
			var y = (e.clientY - (r.top + r.height / 2)) / r.height;
			tilt.style.transform = 'rotateY(' + (x * 10 - 4).toFixed(2) + 'deg) rotateX(' + (-y * 8 + 2).toFixed(2) + 'deg)';
		});
		area.addEventListener('pointerleave', function () {
			tilt.style.transform = '';
		});
	}
})();

/* Formulário de contato (site estático, sem backend): monta a mensagem com os campos
   preenchidos e abre o WhatsApp. O número é o mesmo dos botões da página. */
(function () {
	var form = document.querySelector('[data-whatsapp-form]');
	if (!form) return;
	var WHATSAPP = '351910739970';

	form.addEventListener('submit', function (e) {
		e.preventDefault();
		if (!form.reportValidity()) return;
		var value = function (name) {
			var el = form.elements[name];
			return el ? String(el.value || '').trim() : '';
		};
		var lines = [
			'Olá, B3 Tecnologias! Vim pelo site.',
			'',
			'Nome: ' + value('b3_name'),
			'E-mail: ' + value('b3_email')
		];
		if (value('b3_company')) lines.push('Empresa/site: ' + value('b3_company'));
		lines.push('Interesse: ' + value('b3_service'), '', value('b3_message'));
		var url = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(lines.join('\n'));
		var win = window.open(url, '_blank', 'noopener');
		if (!win) window.location.href = url;
	});
})();
