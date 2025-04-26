<!-- إضافة عنصر صفحة الموظفين -->
<div class="page" id="employees-page">
    <div class="header">
        <button class="toggle-sidebar">
            <i class="fas fa-bars"></i>
        </button>
        <h1 class="page-title">إدارة الموظفين</h1>
        <div class="header-actions">
            <div class="search-box">
                <input class="search-input" placeholder="بحث عن موظف..." type="text" />
                <i class="fas fa-search search-icon"></i>
            </div>
            <button class="btn btn-primary" id="add-employee-btn">
                <i class="fas fa-plus"></i>
                <span>إضافة موظف</span>
            </button>
        </div>
    </div>
    <div class="section">
        <div class="section-header">
            <h2 class="section-title">قائمة الموظفين</h2>
            <div class="section-actions">
                <div class="btn-group">
                    <button class="btn btn-outline btn-sm active" data-filter="all">الكل</button>
                    <button class="btn btn-outline btn-sm" data-filter="active">نشط</button>
                    <button class="btn btn-outline btn-sm" data-filter="inactive">غير نشط</button>
                </div>
                <button class="btn btn-outline btn-sm" title="تصدير">
                    <i class="fas fa-download"></i>
                    <span>تصدير</span>
                </button>
            </div>
        </div>
        <div class="table-container">
            <table id="employees-table">
                <thead>
                    <tr>
                        <th>المعرف</th>
                        <th>الموظف</th>
                        <th>المسمى الوظيفي</th>
                        <th>رقم الهاتف</th>
                        <th>تاريخ التعيين</th>
                        <th>الراتب الأساسي</th>
                        <th>الحالة</th>
                        <th>الإجراءات</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- سيتم ملؤها ديناميكيًا -->
                </tbody>
            </table>
        </div>
        <div class="pagination">
            <div class="page-item disabled">
                <i class="fas fa-chevron-right"></i>
            </div>
            <div class="page-item active">1</div>
            <div class="page-item">2</div>
            <div class="page-item">3</div>
            <div class="page-item">
                <i class="fas fa-chevron-left"></i>
            </div>
        </div>
    </div>
    
    <!-- قسم تقارير الرواتب -->
    <div class="section">
        <div class="section-header">
            <h2 class="section-title">تقارير الرواتب</h2>
            <div class="section-actions">
                <div class="form-group" style="display: inline-block; margin-left: 10px;">
                    <select class="form-select" id="salary-month">
                        <option value="1">يناير</option>
                        <option value="2">فبراير</option>
                        <option value="3">مارس</option>
                        <option value="4">أبريل</option>
                        <option value="5">مايو</option>
                        <option value="6">يونيو</option>
                        <option value="7">يوليو</option>
                        <option value="8">أغسطس</option>
                        <option value="9">سبتمبر</option>
                        <option value="10">أكتوبر</option>
                        <option value="11">نوفمبر</option>
                        <option value="12">ديسمبر</option>
                    </select>
                </div>
                <div class="form-group" style="display: inline-block; margin-left: 10px;">
                    <select class="form-select" id="salary-year">
                        <!-- سيتم ملؤها ديناميكيًا -->
                    </select>
                </div>
                <button class="btn btn-primary btn-sm" id="generate-payroll-btn">
                    <i class="fas fa-file-invoice-dollar"></i>
                    <span>إنشاء كشف الرواتب</span>
                </button>
                <button class="btn btn-outline btn-sm" id="export-payroll-btn" title="تصدير كشف الرواتب">
                    <i class="fas fa-download"></i>
                    <span>تصدير</span>
                </button>
            </div>
        </div>
        <div class="table-container">
            <table id="payroll-table">
                <thead>
                    <tr>
                        <th>المعرف</th>
                        <th>الموظف</th>
                        <th>المسمى الوظيفي</th>
                        <th>الراتب الأساسي</th>
                        <th>نسبة المبيعات</th>
                        <th>قيمة المبيعات</th>
                        <th>مبلغ العمولة</th>
                        <th>البدلات</th>
                        <th>الاستقطاعات</th>
                        <th>صافي الراتب</th>
                        <th>الإجراءات</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- سيتم ملؤها ديناميكيًا -->
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3"><strong>الإجمالي</strong></td>
                        <td id="total-base-salary">0 دينار</td>
                        <td>-</td>
                        <td id="total-sales">0 دينار</td>
                        <td id="total-commission">0 دينار</td>
                        <td id="total-allowances">0 دينار</td>
                        <td id="total-deductions">0 دينار</td>
                        <td id="total-net-salary">0 دينار</td>
                        <td>-</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    </div>
</div>

<!-- نافذة إضافة موظف جديد -->
<div class="modal-overlay" id="add-employee-modal">
    <div class="modal animate__animated animate__fadeInUp">
        <div class="modal-header">
            <h3 class="modal-title">إضافة موظف جديد</h3>
            <button class="modal-close">×</button>
        </div>
        <div class="modal-body">
            <form id="add-employee-form">
                <div class="grid-cols-2">
                    <div class="form-group">
                        <label class="form-label">اسم الموظف</label>
                        <div class="input-group">
                            <input class="form-input" id="employee-name" required="" type="text" />
                            <button class="btn btn-icon-sm mic-btn" data-input="employee-name" type="button">
                                <i class="fas fa-microphone"></i>
                            </button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">رقم الهاتف</label>
                        <div class="input-group">
                            <input class="form-input" id="employee-phone" required="" type="tel" />
                            <button class="btn btn-icon-sm mic-btn" data-input="employee-phone" type="button">
                                <i class="fas fa-microphone"></i>
                            </button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">العنوان</label>
                        <div class="input-group">
                            <input class="form-input" id="employee-address" required="" type="text" />
                            <button class="btn btn-icon-sm mic-btn" data-input="employee-address" type="button">
                                <i class="fas fa-microphone"></i>
                            </button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">البريد الإلكتروني</label>
                        <div class="input-group">
                            <input class="form-input" id="employee-email" type="email" />
                            <button class="btn btn-icon-sm mic-btn" data-input="employee-email" type="button">
                                <i class="fas fa-microphone"></i>
                            </button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">رقم الهوية</label>
                        <div class="input-group">
                            <input class="form-input" id="employee-id-number" required="" type="text" />
                            <button class="btn btn-icon-sm mic-btn" data-input="employee-id-number" type="button">
                                <i class="fas fa-microphone"></i>
                            </button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">تاريخ التعيين</label>
                        <input class="form-input" id="employee-hire-date" required="" type="date" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">المسمى الوظيفي</label>
                        <div class="input-group">
                            <input class="form-input" id="employee-position" required="" type="text" />
                            <button class="btn btn-icon-sm mic-btn" data-input="employee-position" type="button">
                                <i class="fas fa-microphone"></i>
                            </button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">القسم</label>
                        <div class="input-group">
                            <input class="form-input" id="employee-department" required="" type="text" />
                            <button class="btn btn-icon-sm mic-btn" data-input="employee-department" type="button">
                                <i class="fas fa-microphone"></i>
                            </button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">الراتب الأساسي (دينار)</label>
                        <div class="input-group">
                            <input class="form-input" id="employee-salary" min="0" required="" step="1000" type="number" />
                            <button class="btn btn-icon-sm mic-btn" data-input="employee-salary" type="button">
                                <i class="fas fa-microphone"></i>
                            </button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">نسبة المبيعات (%)</label>
                        <div class="input-group">
                            <input class="form-input" id="employee-commission-rate" min="0" max="100" step="0.1" type="number" value="0" />
                            <button class="btn btn-icon-sm mic-btn" data-input="employee-commission-rate" type="button">
                                <i class="fas fa-microphone"></i>
                            </button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">البدلات (دينار)</label>
                        <div class="input-group">
                            <input class="form-input" id="employee-allowance" min="0" step="1000" type="number" value="0" />
                            <button class="btn btn-icon-sm mic-btn" data-input="employee-allowance" type="button">
                                <i class="fas fa-microphone"></i>
                            </button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">الحالة</label>
                        <select class="form-select" id="employee-status">
                            <option value="active">نشط</option>
                            <option value="inactive">غير نشط</option>
                        </select>
                    </div>
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button class="btn btn-outline modal-close-btn">إلغاء</button>
            <button class="btn btn-primary" id="save-employee-btn">إضافة</button>
        </div>
    </div>
</div>

<!-- نافذة تفاصيل الموظف -->
<div class="modal-overlay" id="employee-details-modal">
    <div class="modal animate__animated animate__fadeInUp">
        <div class="modal-header">
            <h3 class="modal-title">تفاصيل الموظف</h3>
            <button class="modal-close">×</button>
        </div>
        <div class="modal-body">
            <div id="employee-details-content">
                <!-- سيتم ملؤها ديناميكيًا -->
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn btn-outline modal-close-btn">إغلاق</button>
            <div class="btn-group">
                <button class="btn btn-primary" id="edit-employee-btn">
                    <i class="fas fa-edit"></i>
                    <span>تعديل</span>
                </button>
                <button class="btn btn-success" id="pay-salary-btn">
                    <i class="fas fa-money-bill-wave"></i>
                    <span>دفع الراتب</span>
                </button>
                <button class="btn btn-danger" id="delete-employee-btn">
                    <i class="fas fa-trash"></i>
                    <span>حذف</span>
                </button>
            </div>
        </div>
    </div>
</div>

<!-- نافذة إضافة راتب -->
<div class="modal-overlay" id="add-salary-modal">
    <div class="modal animate__animated animate__fadeInUp">
        <div class="modal-header">
            <h3 class="modal-title">إضافة راتب شهري</h3>
            <button class="modal-close">×</button>
        </div>
        <div class="modal-body">
            <form id="add-salary-form">
                <input type="hidden" id="salary-employee-id" value="" />
                <div class="grid-cols-2">
                    <div class="form-group">
                        <label class="form-label">الموظف</label>
                        <input class="form-input" id="salary-employee-name" readonly type="text" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">الشهر</label>
                        <select class="form-select" id="add-salary-month" required>
                            <option value="1">يناير</option>
                            <option value="2">فبراير</option>
                            <option value="3">مارس</option>
                            <option value="4">أبريل</option>
                            <option value="5">مايو</option>
                            <option value="6">يونيو</option>
                            <option value="7">يوليو</option>
                            <option value="8">أغسطس</option>
                            <option value="9">سبتمبر</option>
                            <option value="10">أكتوبر</option>
                            <option value="11">نوفمبر</option>
                            <option value="12">ديسمبر</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">السنة</label>
                        <select class="form-select" id="add-salary-year" required>
                            <!-- سيتم ملؤها ديناميكيًا -->
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">الراتب الأساسي (دينار)</label>
                        <input class="form-input" id="salary-base" readonly type="number" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">نسبة المبيعات (%)</label>
                        <input class="form-input" id="salary-commission-rate" readonly type="number" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">قيمة المبيعات (دينار)</label>
                        <div class="input-group">
                            <input class="form-input" id="salary-sales-amount" min="0" required="" step="1000" type="number" value="0" />
                            <button class="btn btn-icon-sm mic-btn" data-input="salary-sales-amount" type="button">
                                <i class="fas fa-microphone"></i>
                            </button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">مبلغ العمولة (دينار)</label>
                        <input class="form-input" id="salary-commission-amount" readonly type="number" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">البدلات (دينار)</label>
                        <div class="input-group">
                            <input class="form-input" id="salary-allowance" min="0" step="1000" type="number" />
                            <button class="btn btn-icon-sm mic-btn" data-input="salary-allowance" type="button">
                                <i class="fas fa-microphone"></i>
                            </button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">الاستقطاعات (دينار)</label>
                        <div class="input-group">
                            <input class="form-input" id="salary-deduction" min="0" step="1000" type="number" value="0" />
                            <button class="btn btn-icon-sm mic-btn" data-input="salary-deduction" type="button">
                                <i class="fas fa-microphone"></i>
                            </button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">صافي الراتب (دينار)</label>
                        <input class="form-input" id="salary-net" readonly type="number" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">ملاحظات</label>
                        <textarea class="form-input" id="salary-notes" rows="3"></textarea>
                    </div>
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button class="btn btn-outline modal-close-btn">إلغاء</button>
            <button class="btn btn-primary" id="save-salary-btn">دفع الراتب</button>
        </div>
    </div>
</div>

<!-- نافذة تفاصيل الراتب -->
<div class="modal-overlay" id="salary-details-modal">
    <div class="modal animate__animated animate__fadeInUp">
        <div class="modal-header">
            <h3 class="modal-title">تفاصيل الراتب</h3>
            <button class="modal-close">×</button>
        </div>
        <div class="modal-body">
            <div id="salary-details-content">
                <!-- سيتم ملؤها ديناميكيًا -->
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn btn-outline modal-close-btn">إغلاق</button>
            <button class="btn btn-primary" id="print-salary-btn">
                <i class="fas fa-print"></i>
                <span>طباعة</span>
            </button>
        </div>
    </div>
</div>