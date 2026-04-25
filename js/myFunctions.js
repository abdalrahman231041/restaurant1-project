document.addEventListener('DOMContentLoaded', function() {
    
    // =============================================
    // 1. إظهار وإخفاء تفاصيل الوجبات
    // =============================================
    document.querySelectorAll('.toggle-details').forEach(cb => {
        cb.addEventListener('change', function() {
            let targetId = this.getAttribute('data-target');
            let detailsRow = document.getElementById(targetId);
            if (detailsRow) {
                detailsRow.style.display = this.checked ? 'table-row' : 'none';
            }
        });
    });

    // =============================================
    // 2. المتغيرات الأساسية
    // =============================================
    let totalSpan = document.getElementById('total-price');
    let summaryDiv = document.getElementById('selected-items-summary');
    let items = document.querySelectorAll('.select-item');
    let formContainer = document.getElementById('order-form-container');
    let successMessage = document.getElementById('success-message');

    // =============================================
    // 3. تحديث ملخص الوجبات والإجمالي
    // =============================================
    function updateSummary() {
        let total = 0;
        let html = '<ul>';
        
        items.forEach(item => {
            if (item.checked) {
                let price = parseInt(item.getAttribute('data-price'));
                let name = item.getAttribute('data-name');
                total += price;
                html += `<li>${name} - ${price.toLocaleString()} ل.س</li>`;
            }
        });
        
        html += '</ul>';
        summaryDiv.innerHTML = html;
        totalSpan.textContent = total.toLocaleString();
    }

    // ربط حدث التغيير بكل مربعات الاختيار
    items.forEach(item => {
        item.addEventListener('change', updateSummary);
    });

    // =============================================
    // 4. زر المتابعة - إظهار النموذج
    // =============================================
    document.getElementById('checkout-btn').addEventListener('click', function() {
        // التحقق من اختيار وجبة واحدة على الأقل
        let selectedCount = 0;
        items.forEach(item => {
            if (item.checked) selectedCount++;
        });
        
        if (selectedCount === 0) {
            alert('الرجاء اختيار وجبة واحدة على الأقل قبل المتابعة.');
            return;
        }
        
        formContainer.style.display = 'block';
        updateSummary();
    });

    // =============================================
    // 5. دوال التحقق (Validation)
    // =============================================
    
    // التحقق من الاسم: أحرف إنجليزية + مسافة واحدة بين الاسم والكنية
    function validateName(name) {
        // يسمح فقط بحروف إنجليزية ومسافة واحدة بينها، بدون أرقام أو رموز
        let regex = /^[A-Za-z]+ [A-Za-z]+$/;
        return regex.test(name);
    }
    
    // التحقق من رقم الحساب: 6 أرقام بالضبط، يمكن أن يبدأ بصفر
    function validateAccount(acc) {
        let regex = /^\d{6}$/;
        return regex.test(acc);
    }
    
    // التحقق من تاريخ الطلب: يجب أن يكون تاريخاً صحيحاً وليس في الماضي
    function validateOrderDate(dateStr) {
        if (!dateStr) return false;
        
        let selectedDate = new Date(dateStr + 'T00:00:00');
        let today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // تاريخ الطلب يجب أن يكون اليوم أو بعده
        return selectedDate >= today;
    }
    
    // التحقق من رقم الموبايل السوري: يبدأ بـ 09 ثم 8 أرقام
    function validateMobile(mobile) {
        let regex = /^09\d{8}$/;
        return regex.test(mobile);
    }

    // =============================================
    // 6. إرسال النموذج والتحقق
    // =============================================
    document.getElementById('order-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        let isValid = true;
        
        // جلب القيم من الحقول
        let nameValue = document.getElementById('fullname').value.trim();
        let accountValue = document.getElementById('bank-account').value.trim();
        let dateValue = document.getElementById('order-date').value;
        let mobileValue = document.getElementById('mobile').value.trim();
        
        // جلب عناصر الأخطاء
        let nameError = document.getElementById('name-error');
        let accountError = document.getElementById('account-error');
        let dateError = document.getElementById('date-error');
        let mobileError = document.getElementById('mobile-error');
        
        // مسح الأخطاء السابقة
        nameError.textContent = '';
        accountError.textContent = '';
        dateError.textContent = '';
        mobileError.textContent = '';
        
        // التحقق من الاسم
        if (!validateName(nameValue)) {
            nameError.textContent = 'خطأ: يجب إدخال اسم وكنية باللغة الإنجليزية فقط مع مسافة واحدة. مثال: Ahmad Ali';
            isValid = false;
        }
        
        // التحقق من رقم الحساب
        if (!validateAccount(accountValue)) {
            accountError.textContent = 'خطأ: يجب أن يكون رقم الحساب مكوناً من 6 أرقام بالضبط.';
            isValid = false;
        }
        
        // التحقق من تاريخ الطلب
        if (!validateOrderDate(dateValue)) {
            dateError.textContent = 'خطأ: يجب اختيار تاريخ اليوم أو تاريخ مستقبلي.';
            isValid = false;
        }
        
        // التحقق من رقم الموبايل
        if (!validateMobile(mobileValue)) {
            mobileError.textContent = 'خطأ: يجب أن يبدأ رقم الموبايل بـ 09 ثم 8 أرقام. مثال: 0912345678';
            isValid = false;
        }
        
        // إذا كانت جميع البيانات صحيحة
        if (isValid) {
            showSuccessPopup();
        }
    });

    // =============================================
    // 7. إظهار نافذة النجاح مع تفاصيل الفاتورة
    // =============================================
    function showSuccessPopup() {
        // جمع الوجبات المختارة
        let selectedMeals = [];
        let totalAmount = 0;
        
        items.forEach(item => {
            if (item.checked) {
                let name = item.getAttribute('data-name');
                let price = parseInt(item.getAttribute('data-price'));
                selectedMeals.push({ name: name, price: price });
                totalAmount += price;
            }
        });
        
        // حساب الضريبة والمبلغ الصافي
        let tax = totalAmount * 0.10;           // ضريبة 10%
        let netTotal = totalAmount + tax;       // المبلغ الصافي بعد الضريبة
        
        // بناء نص الفاتورة
        let message = '========== فاتورة الطلب ==========\n\n';
        message += 'الوجبات المختارة:\n';
        message += '--------------------------------\n';
        
        selectedMeals.forEach((meal, index) => {
            message += `${index + 1}. ${meal.name}: ${meal.price.toLocaleString()} ل.س\n`;
        });
        
        message += '\n================================\n';
        message += `المبلغ الإجمالي (قبل الضريبة): ${totalAmount.toLocaleString()} ل.س\n`;
        message += `مبلغ الضريبة (10%): ${tax.toLocaleString()} ل.س\n`;
        message += '--------------------------------\n';
        message += `المبلغ الصافي (بعد الضريبة): ${netTotal.toLocaleString()} ل.س\n`;
        message += '================================\n\n';
        message += 'شكراً لثقتكم! سيتم تأكيد طلبكم قريباً.';
        
        // إظهار النافذة المنبثقة
        alert(message);
        
        // إظهار رسالة نجاح تحت النموذج
        successMessage.style.display = 'block';
        successMessage.innerHTML = `
            <div style="border: 2px solid green; padding: 15px; background: #e8f5e9;">
                <h3>✅ تم إرسال الطلب بنجاح!</h3>
                <p><strong>الإجمالي:</strong> ${totalAmount.toLocaleString()} ل.س</p>
                <p><strong>الضريبة (10%):</strong> ${tax.toLocaleString()} ل.س</p>
                <p><strong>الصافي:</strong> ${netTotal.toLocaleString()} ل.س</p>
            </div>
        `;
        
        // إعادة تعيين النموذج
        document.getElementById('order-form').reset();
        items.forEach(i => i.checked = false);
        updateSummary();
    }
});