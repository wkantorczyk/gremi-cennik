const TRANSLATIONS = {
  pl: {
    tab_order: 'Zamówienie', tab_history: 'Historia', tab_stats: 'Statystyki',
    tab_config: 'Konfiguracja', tab_settings: 'Ustawienia',
    btn_wydano: 'WYDANO', btn_add_product: 'Dodaj produkt',
    btn_confirm: 'Potwierdź', btn_cancel: 'Anuluj',
    confirm_wydano: 'Potwierdzasz zamówienie?',
    confirm_price: 'Zmienić cenę {name} z {old} zł na {new} zł?',
    confirm_delete_order: 'Usunąć zamówienie #{n} ({total} zł)?',
    label_total: 'Razem', label_suma: 'SUMA',
    label_customers: 'Liczba klientów', label_revenue: 'Łączna suma',
    label_ranking: 'Ranking produktów',
    col_product: 'Produkt', col_sold: 'Sprzedano (szt.)', col_revenue: 'Przychód (zł)',
    label_seller_name: 'Imię sprzedawcy', label_language: 'Język',
    label_high_contrast: 'Tryb wysokiego kontrastu',
    label_sort_popular: 'Sortuj menu po najpopularniejszych',
    label_sync_status: 'Status synchronizacji', label_last_sync: 'Ostatni sync',
    btn_sync_now: 'Synchronizuj teraz', sync_never: 'Nigdy',
    label_price: 'Cena (zł)', label_name: 'Nazwa',
    order_prefix: 'ZAMÓWIENIE',
    no_orders: 'Brak zamówień', no_data: 'Brak danych',
    toast_saved: 'Zapisano!', toast_empty: 'Dodaj co najmniej 1 produkt',
    toast_sync_error: 'Brak połączenia — dane zapisane lokalnie',
    error_storage: 'Błąd zapisu danych — sprawdź pamięć urządzenia',
    error_name_required: 'Wpisz nazwę produktu',
    error_price_invalid: 'Cena musi być większa od 0',
    onboarding_title: 'Witaj w Gremi-Cennik',
    onboarding_prompt: 'Podaj swoje imię, aby zacząć',
    onboarding_placeholder: 'Twoje imię',
    onboarding_btn: 'Rozpocznij',
    sync_ok: 'Zsynchronizowano', sync_error: 'Błąd sync',
    order_details_title: 'Szczegóły zamówienia',
    label_my_stats: 'Twoje statystyki',
    label_global_stats: 'Globalne statystyki',
    label_global_customers: 'Łączna liczba klientów (wszyscy)',
    label_global_revenue: 'Łączna suma (wszyscy)',
    global_stats_loading: 'Pobieranie...',
    global_stats_no_config: 'Wymaga konfiguracji bazy danych',
    global_stats_error: 'Błąd pobierania danych globalnych',
    global_stats_disclaimer: '* Globalne statystyki są szacunkowe. Dane mogą być niepełne — sprzedawcy mogą pominąć lub błędnie wprowadzić zamówienia.',
  },
  uk: {
    tab_order: 'Замовлення', tab_history: 'Історія', tab_stats: 'Статистика',
    tab_config: 'Конфігурація', tab_settings: 'Налаштування',
    btn_wydano: 'ВИДАНО', btn_add_product: 'Додати товар',
    btn_confirm: 'Підтвердити', btn_cancel: 'Скасувати',
    confirm_wydano: 'Підтверджуєте замовлення?',
    confirm_price: 'Змінити ціну {name} з {old} зл на {new} зл?',
    confirm_delete_order: 'Видалити замовлення #{n} ({total} зл)?',
    label_total: 'Разом', label_suma: 'СУМА',
    label_customers: 'Кількість клієнтів', label_revenue: 'Загальна сума',
    label_ranking: 'Рейтинг товарів',
    col_product: 'Товар', col_sold: 'Продано (шт.)', col_revenue: 'Виручка (зл)',
    label_seller_name: 'Ім\'я продавця', label_language: 'Мова',
    label_high_contrast: 'Режим високої контрастності',
    label_sort_popular: 'Сортувати меню за популярністю',
    label_sync_status: 'Статус синхронізації', label_last_sync: 'Остання синхронізація',
    btn_sync_now: 'Синхронізувати', sync_never: 'Ніколи',
    label_price: 'Ціна (зл)', label_name: 'Назва',
    order_prefix: 'ЗАМОВЛЕННЯ',
    no_orders: 'Немає замовлень', no_data: 'Немає даних',
    toast_saved: 'Збережено!', toast_empty: 'Додайте хоча б 1 товар',
    toast_sync_error: 'Немає зв\'язку — дані збережено локально',
    error_storage: 'Помилка запису — перевірте пам\'ять пристрою',
    error_name_required: 'Введіть назву товару',
    error_price_invalid: 'Ціна має бути більшою за 0',
    onboarding_title: 'Ласкаво просимо до Gremi-Cennik',
    onboarding_prompt: 'Введіть ваше ім\'я, щоб почати',
    onboarding_placeholder: 'Ваше ім\'я',
    onboarding_btn: 'Розпочати',
    sync_ok: 'Синхронізовано', sync_error: 'Помилка синхронізації',
    order_details_title: 'Деталі замовлення',
    label_my_stats: 'Ваша статистика',
    label_global_stats: 'Глобальна статистика',
    label_global_customers: 'Загальна кількість клієнтів (усі)',
    label_global_revenue: 'Загальна сума (усі)',
    global_stats_loading: 'Завантаження...',
    global_stats_no_config: 'Потрібна конфігурація бази даних',
    global_stats_error: 'Помилка завантаження глобальних даних',
    global_stats_disclaimer: '* Глобальна статистика є приблизною. Дані можуть бути неповними — продавці можуть пропустити або неправильно ввести замовлення.',
  }
}

function t(key, vars) {
  const lang = state && state.settings && state.settings.lang ? state.settings.lang : 'pl'
  let str = (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) || (TRANSLATIONS['pl'][key]) || key
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace('{' + k + '}', v)
    }
  }
  return str
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    if (!el.children.length) el.textContent = t(el.getAttribute('data-i18n'))
  })
  const lang = state.settings.lang || 'pl'
  document.documentElement.lang = lang
  const inp = document.getElementById('onboarding-input')
  if (inp) inp.placeholder = t('onboarding_placeholder')
}
