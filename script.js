/* ========================================================
   OpenSooq Car Loan Calculator – Script
   ======================================================== */

(function () {
    'use strict';

    /* ---------- Dummy car data ---------- */
    var CARS = [
        { name: 'Toyota Camry 2025', price: 105000, badge: 'Popular' },
        { name: 'Nissan Altima 2025', price: 89000, badge: 'Great Value' },
        { name: 'Hyundai Tucson 2025', price: 115000, badge: 'SUV Pick' }
    ];

    /* ---------- Helpers ---------- */
    function formatAED(n) {
        return 'AED ' + Number(n).toLocaleString('en-AE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    function stripNonNumeric(str) {
        return str.replace(/[^0-9.]/g, '');
    }

    function parseNum(str) {
        var cleaned = stripNonNumeric(str);
        return cleaned === '' ? NaN : parseFloat(cleaned);
    }

    /* ---------- EMI Calculation ---------- */
    function calculateEMI(principal, annualRate, years) {
        var months = years * 12;

        if (annualRate === 0) {
            return {
                emi: principal / months,
                totalPayment: principal,
                totalInterest: 0,
                months: months
            };
        }

        var r = annualRate / 12 / 100;
        var factor = Math.pow(1 + r, months);
        var emi = principal * r * factor / (factor - 1);

        return {
            emi: emi,
            totalPayment: emi * months,
            totalInterest: (emi * months) - principal,
            months: months
        };
    }

    /* ---------- Car-level EMI (same rate & tenure) ---------- */
    function carEMI(carPrice, downPayment, annualRate, years) {
        var dp = Math.min(downPayment, carPrice);
        var principal = carPrice - dp;
        if (principal <= 0) return 0;
        return calculateEMI(principal, annualRate, years).emi;
    }

    /* ---------- Render car cards ---------- */
    function renderCars(downPayment, annualRate, years) {
        var grid = document.getElementById('carsGrid');
        grid.innerHTML = '';

        CARS.forEach(function (car) {
            var emi = carEMI(car.price, downPayment, annualRate, years);

            var card = document.createElement('div');
            card.className = 'car-card';

            card.innerHTML =
                '<div class="car-card-img">' +
                '<span class="car-icon">&#128663;</span>' +
                '<span class="car-badge">' + car.badge + '</span>' +
                '</div>' +
                '<div class="car-card-body">' +
                '<div class="car-card-name">' + car.name + '</div>' +
                '<div class="car-card-price">Price: ' + formatAED(car.price) + '</div>' +
                '<span class="car-card-emi">~' + formatAED(emi) + '/mo</span>' +
                '</div>';

            grid.appendChild(card);
        });

        var section = document.getElementById('carsSection');
        section.classList.add('visible');
    }

    /* ---------- Validation ---------- */
    function setError(id, on) {
        var el = document.getElementById(id);
        if (!el) return;
        var field = el.closest('.field');
        if (!field) return;
        if (on) { field.classList.add('error'); } else { field.classList.remove('error'); }
    }

    function validate(carPrice, downPayment, rate, tenure) {
        var ok = true;

        setError('carPrice', false);
        setError('downPayment', false);
        setError('interestRate', false);
        setError('loanTenure', false);

        if (isNaN(carPrice) || carPrice <= 0) { setError('carPrice', true); ok = false; }
        if (isNaN(downPayment) || downPayment < 0) { setError('downPayment', true); ok = false; }
        if (isNaN(rate) || rate < 0) { setError('interestRate', true); ok = false; }
        if (isNaN(tenure) || tenure <= 0) { setError('loanTenure', true); ok = false; }

        if (ok && downPayment >= carPrice) {
            setError('downPayment', true);
            ok = false;
        }

        return ok;
    }

    /* ---------- Main handler ---------- */
    function handleCalculate(e) {
        e.preventDefault();

        var carPrice = parseNum(document.getElementById('carPrice').value);
        var downPayment = parseNum(document.getElementById('downPayment').value);
        var rate = parseNum(document.getElementById('interestRate').value);
        var tenure = parseNum(document.getElementById('loanTenure').value);

        if (!validate(carPrice, downPayment, rate, tenure)) return;

        var principal = carPrice - downPayment;
        var result = calculateEMI(principal, rate, tenure);

        document.getElementById('emiValue').textContent = formatAED(result.emi);
        document.getElementById('totalPayment').textContent = formatAED(result.totalPayment);
        document.getElementById('totalInterest').textContent = formatAED(result.totalInterest);

        document.getElementById('resultsPanel').classList.add('visible');

        renderCars(downPayment, rate, tenure);

        /* Smooth scroll to results */
        document.getElementById('resultsPanel').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    /* ---------- Init ---------- */
    document.getElementById('loanForm').addEventListener('submit', handleCalculate);

})();