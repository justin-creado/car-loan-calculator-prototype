// script.js

document.addEventListener('DOMContentLoaded', function () {

  // ── DOM refs ──────────────────────────────────────────────────────────
  var calcBtn            = document.getElementById('calcBtn');
  var resultsPlaceholder = document.getElementById('resultsPlaceholder');
  var resultsContent     = document.getElementById('resultsContent');
  var listingsGrid       = document.getElementById('listingsGrid');

  // ── Car listings data ─────────────────────────────────────────────────
  var carListings = [
    { title: '2022 Toyota Camry',   price: 89000 },
    { title: '2023 Nissan Altima',  price: 72500 },
    { title: '2021 Honda Accord',   price: 68000 },
    { title: '2022 Hyundai Tucson', price: 95000 },
    { title: '2023 Kia Sportage',   price: 81000 },
    { title: '2020 Ford Edge',      price: 76500 },
  ];

  // SVG car icon used as a neutral placeholder in every listing card
  var carSVG =
    '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M8 36l4-12h40l4 12" stroke="#9ca3af" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<rect x="4" y="36" width="56" height="14" rx="4" stroke="#9ca3af" stroke-width="2.5"/>' +
      '<circle cx="16" cy="50" r="5" stroke="#9ca3af" stroke-width="2.5"/>' +
      '<circle cx="48" cy="50" r="5" stroke="#9ca3af" stroke-width="2.5"/>' +
      '<path d="M21 50h22" stroke="#9ca3af" stroke-width="2.5" stroke-linecap="round"/>' +
      '<path d="M16 36l3-8h26l3 8" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg>';

  // ── Utility ───────────────────────────────────────────────────────────

  /**
   * Format a number as "AED 12,345"
   * @param {number} num
   * @returns {string}
   */
  function formatAED(num) {
    return 'AED ' + Math.round(num).toLocaleString('en-US');
  }

  // ── Validation ────────────────────────────────────────────────────────

  /**
   * Validate all inputs, show inline errors.
   * @returns {boolean} true if all pass
   */
  function validateInputs() {
    var valid = true;

    function setError(inputId, errId, message) {
      document.getElementById(inputId).classList.add('invalid');
      document.getElementById(errId).textContent = message;
      valid = false;
    }

    function clearError(inputId, errId) {
      document.getElementById(inputId).classList.remove('invalid');
      document.getElementById(errId).textContent = '';
    }

    // Clear all first
    ['carPrice', 'downPayment', 'interestRate', 'loanTenure', 'monthlyIncome'].forEach(function (id) {
      clearError(id, 'err-' + id);
    });

    // --- Car Price ---
    var carPriceRaw = document.getElementById('carPrice').value.trim();
    var carPrice    = parseFloat(carPriceRaw);
    if (carPriceRaw === '') {
      setError('carPrice', 'err-carPrice', 'Car Price is required.');
    } else if (isNaN(carPrice) || carPrice <= 0) {
      setError('carPrice', 'err-carPrice', 'Car Price must be a positive number.');
    }

    // --- Down Payment ---
    var downPaymentRaw = document.getElementById('downPayment').value.trim();
    var downPayment    = parseFloat(downPaymentRaw);
    if (downPaymentRaw === '') {
      setError('downPayment', 'err-downPayment', 'Down Payment is required.');
    } else if (isNaN(downPayment) || downPayment < 0) {
      setError('downPayment', 'err-downPayment', 'Down Payment must be 0 or more.');
    } else if (!isNaN(carPrice) && carPrice > 0 && downPayment >= carPrice) {
      setError('downPayment', 'err-downPayment', 'Down Payment must be less than the Car Price.');
    }

    // --- Interest Rate ---
    var interestRateRaw = document.getElementById('interestRate').value.trim();
    var interestRate    = parseFloat(interestRateRaw);
    if (interestRateRaw === '') {
      setError('interestRate', 'err-interestRate', 'Interest Rate is required.');
    } else if (isNaN(interestRate) || interestRate < 0) {
      setError('interestRate', 'err-interestRate', 'Interest Rate must be 0 or more.');
    } else if (interestRate > 30) {
      setError('interestRate', 'err-interestRate', 'Interest Rate must not exceed 30%.');
    }

    // --- Loan Tenure ---
    if (!document.getElementById('loanTenure').value) {
      setError('loanTenure', 'err-loanTenure', 'Please select a Loan Tenure.');
    }

    // --- Monthly Income ---
    var monthlyIncomeRaw = document.getElementById('monthlyIncome').value.trim();
    var monthlyIncome    = parseFloat(monthlyIncomeRaw);
    if (monthlyIncomeRaw === '') {
      setError('monthlyIncome', 'err-monthlyIncome', 'Monthly Income is required.');
    } else if (isNaN(monthlyIncome) || monthlyIncome <= 0) {
      setError('monthlyIncome', 'err-monthlyIncome', 'Monthly Income must be greater than 0.');
    }

    return valid;
  }

  // ── Calculation ───────────────────────────────────────────────────────

  /**
   * Read inputs, run amortization formula, update UI.
   */
  function calculateLoan() {
    if (!validateInputs()) return;

    var carPrice      = parseFloat(document.getElementById('carPrice').value);
    var downPayment   = parseFloat(document.getElementById('downPayment').value);
    var interestRate  = parseFloat(document.getElementById('interestRate').value);
    var loanTenure    = parseInt(document.getElementById('loanTenure').value, 10);
    var monthlyIncome = parseFloat(document.getElementById('monthlyIncome').value);

    // Step 1: Loan Amount
    var loanAmount = carPrice - downPayment;

    // Step 2: Monthly Payment (standard amortization formula)
    var monthlyRate = interestRate / 12 / 100;
    var months      = loanTenure * 12;
    var monthlyPayment;

    if (monthlyRate === 0) {
      monthlyPayment = loanAmount / months;
    } else {
      var factor     = Math.pow(1 + monthlyRate, months);
      monthlyPayment = loanAmount * (monthlyRate * factor) / (factor - 1);
    }

    // Step 3: Derived values
    var totalCost        = monthlyPayment * months;
    var totalInterest    = totalCost - loanAmount;
    var salaryPercentage = (monthlyPayment / monthlyIncome) * 100;

    updateUI({
      monthlyPayment:   monthlyPayment,
      loanAmount:       loanAmount,
      totalInterest:    totalInterest,
      totalCost:        totalCost,
      salaryPercentage: salaryPercentage,
    });
  }

  // ── UI update ─────────────────────────────────────────────────────────

  /**
   * Populate results card and reveal it.
   * @param {object} results
   */
  function updateUI(results) {
    document.getElementById('resMonthly').textContent       = formatAED(results.monthlyPayment);
    document.getElementById('resLoanAmount').textContent    = formatAED(results.loanAmount);
    document.getElementById('resTotalInterest').textContent = formatAED(results.totalInterest);
    document.getElementById('resTotalCost').textContent     = formatAED(results.totalCost);
    document.getElementById('resSalaryPct').textContent     = results.salaryPercentage.toFixed(1) + '%';

    // Affordability badge
    var badge = document.getElementById('affordBadge');
    badge.className = 'afford-badge';

    if (results.salaryPercentage < 30) {
      badge.classList.add('affordable');
      badge.textContent = 'Affordable ✓';
    } else if (results.salaryPercentage <= 50) {
      badge.classList.add('moderate');
      badge.textContent = 'Moderate ⚠';
    } else {
      badge.classList.add('high-risk');
      badge.textContent = 'High Risk ✗';
    }

    // Swap placeholder for results using inline style (reliable cross-browser)
    resultsPlaceholder.style.display = 'none';
    resultsContent.style.display     = 'block';
  }

  // ── Car Listings ──────────────────────────────────────────────────────

  /**
   * Render all car listing cards with clean grey placeholders.
   */
  function renderListings() {
    carListings.forEach(function (car) {
      var estMonthly = Math.round(car.price * 0.018);

      var card       = document.createElement('div');
      card.className = 'car-card';

      card.innerHTML =
        // Grey placeholder with neutral car SVG icon — no external images
        '<div class="car-img-placeholder">' + carSVG + '</div>' +
        '<div class="car-card-body">' +
          '<div class="car-title">' + car.title + '</div>' +
          '<div class="car-price">' + formatAED(car.price) + '</div>' +
          '<span class="car-monthly-badge">Est. AED ' + estMonthly.toLocaleString('en-US') + '/mo</span>' +
          '<button class="btn-outline">View Listing &rarr;</button>' +
        '</div>';

      listingsGrid.appendChild(card);
    });
  }

  // ── Event listeners ───────────────────────────────────────────────────

  calcBtn.addEventListener('click', calculateLoan);

  // Enter key in any calculator input triggers calculation
  var inputs = document.querySelectorAll('#calculator-section input, #calculator-section select');
  inputs.forEach(function (el) {
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') calculateLoan();
    });
  });

  // ── Init ──────────────────────────────────────────────────────────────
  renderListings();

});
