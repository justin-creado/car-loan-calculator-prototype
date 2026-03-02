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

  // Varied picsum seeds so every card looks different
  var picsumSeeds = [10, 20, 30, 40, 50, 60];

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
   * Validate all inputs.
   * Shows inline error messages and marks invalid fields.
   * @returns {boolean} true if all inputs pass
   */
  function validateInputs() {
    var valid = true;

    // Helper: set error on a field
    function setError(inputId, errId, message) {
      var el  = document.getElementById(inputId);
      var err = document.getElementById(errId);
      err.textContent = message;
      el.classList.add('invalid');
      valid = false;
    }

    // Helper: clear error on a field
    function clearError(inputId, errId) {
      var el  = document.getElementById(inputId);
      var err = document.getElementById(errId);
      err.textContent = '';
      el.classList.remove('invalid');
    }

    // Clear all errors first
    var allFields = ['carPrice', 'downPayment', 'interestRate', 'loanTenure', 'monthlyIncome'];
    allFields.forEach(function (id) { clearError(id, 'err-' + id); });

    // --- Car Price ---
    var carPriceVal = document.getElementById('carPrice').value.trim();
    var carPrice    = parseFloat(carPriceVal);
    if (carPriceVal === '') {
      setError('carPrice', 'err-carPrice', 'Car Price is required.');
    } else if (isNaN(carPrice) || carPrice <= 0) {
      setError('carPrice', 'err-carPrice', 'Car Price must be a positive number.');
    }

    // --- Down Payment ---
    var downPaymentVal = document.getElementById('downPayment').value.trim();
    var downPayment    = parseFloat(downPaymentVal);
    if (downPaymentVal === '') {
      setError('downPayment', 'err-downPayment', 'Down Payment is required.');
    } else if (isNaN(downPayment) || downPayment < 0) {
      setError('downPayment', 'err-downPayment', 'Down Payment must be 0 or more.');
    } else if (!isNaN(carPrice) && carPrice > 0 && downPayment >= carPrice) {
      setError('downPayment', 'err-downPayment', 'Down Payment must be less than the Car Price.');
    }

    // --- Interest Rate ---
    var interestRateVal = document.getElementById('interestRate').value.trim();
    var interestRate    = parseFloat(interestRateVal);
    if (interestRateVal === '') {
      setError('interestRate', 'err-interestRate', 'Interest Rate is required.');
    } else if (isNaN(interestRate) || interestRate < 0) {
      setError('interestRate', 'err-interestRate', 'Interest Rate must be 0 or more.');
    } else if (interestRate > 30) {
      setError('interestRate', 'err-interestRate', 'Interest Rate must not exceed 30%.');
    }

    // --- Loan Tenure ---
    var loanTenureVal = document.getElementById('loanTenure').value;
    if (!loanTenureVal) {
      setError('loanTenure', 'err-loanTenure', 'Please select a Loan Tenure.');
    }

    // --- Monthly Income ---
    var monthlyIncomeVal = document.getElementById('monthlyIncome').value.trim();
    var monthlyIncome    = parseFloat(monthlyIncomeVal);
    if (monthlyIncomeVal === '') {
      setError('monthlyIncome', 'err-monthlyIncome', 'Monthly Income is required.');
    } else if (isNaN(monthlyIncome) || monthlyIncome <= 0) {
      setError('monthlyIncome', 'err-monthlyIncome', 'Monthly Income must be greater than 0.');
    }

    return valid;
  }

  // ── Calculation ───────────────────────────────────────────────────────

  /**
   * Read inputs, run the amortization formula, call updateUI.
   * Called on button click — validates first.
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
      monthlyPayment:  monthlyPayment,
      loanAmount:      loanAmount,
      totalInterest:   totalInterest,
      totalCost:       totalCost,
      salaryPercentage: salaryPercentage,
    });
  }

  // ── UI update ─────────────────────────────────────────────────────────

  /**
   * Populate the results card with calculated data and reveal it.
   * @param {object} results
   */
  function updateUI(results) {
    // Populate text values
    document.getElementById('resMonthly').textContent       = formatAED(results.monthlyPayment);
    document.getElementById('resLoanAmount').textContent    = formatAED(results.loanAmount);
    document.getElementById('resTotalInterest').textContent = formatAED(results.totalInterest);
    document.getElementById('resTotalCost').textContent     = formatAED(results.totalCost);
    document.getElementById('resSalaryPct').textContent     = results.salaryPercentage.toFixed(1) + '%';

    // Affordability badge
    var badge = document.getElementById('affordBadge');
    badge.className = 'afford-badge'; // reset

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

    // Show results, hide placeholder — using inline style (reliable cross-browser)
    resultsPlaceholder.style.display = 'none';
    resultsContent.style.display     = 'block';
  }

  // ── Car Listings ──────────────────────────────────────────────────────

  /**
   * Build and inject car listing cards into the grid.
   */
  function renderListings() {
    carListings.forEach(function (car, index) {
      var estMonthly = Math.round(car.price * 0.018);
      var seed       = picsumSeeds[index];

      var card       = document.createElement('div');
      card.className = 'car-card';

      card.innerHTML =
        '<img src="https://picsum.photos/seed/' + seed + '/320/200" alt="' + car.title + '" loading="lazy" />' +
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

  // Allow Enter key in any input field to trigger calculation
  var inputs = document.querySelectorAll('#calculator-section input, #calculator-section select');
  inputs.forEach(function (el) {
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') calculateLoan();
    });
  });

  // ── Init ──────────────────────────────────────────────────────────────
  renderListings();

});
