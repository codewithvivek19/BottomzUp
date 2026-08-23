/**
 * Bottomz Up Bar & Grill — Live Events Calendar
 * Vanilla JS calendar engine with date navigation, peek popovers, event modals, and iCal export.
 */
(function () {
  'use strict';

  // Seed default recurring house events
  function generateDefaultEvents(year, month) {
    var events = [];
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (var d = 1; d <= daysInMonth; d++) {
      var date = new Date(year, month, d);
      var dayOfWeek = date.getDay(); // 0 = Sun, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat

      // Wednesday: Wing Wednesday
      if (dayOfWeek === 3) {
        var start = new Date(year, month, d, 17, 0, 0);
        var end = new Date(year, month, d, 21, 0, 0);
        events.push({
          id: 'wing-wed-' + year + '-' + (month + 1) + '-' + d,
          title: 'Wing Wednesday',
          description: 'Bone-in wings, 10 house sauces. Half-price baskets 5-7pm. Full bar and ice cold beers all night.',
          startsAt: start.toISOString(),
          endsAt: end.toISOString(),
          imageUrl: '../assets/images/venue/venue-9.jpg',
          published: true
        });
      }

      // Thursday: Trivia Thursday
      if (dayOfWeek === 4) {
        var start = new Date(year, month, d, 19, 0, 0);
        var end = new Date(year, month, d, 21, 30, 0);
        events.push({
          id: 'trivia-thu-' + year + '-' + (month + 1) + '-' + d,
          title: 'Trivia Thursday',
          description: 'Teams of up to 6. Prizes for top scores. Full bar and wing specials all night. Walk-ins welcome - grab a table early.',
          startsAt: start.toISOString(),
          endsAt: end.toISOString(),
          imageUrl: '../assets/images/venue/venue-6.jpg',
          published: true
        });
      }

      // Friday: Friday Night Smash
      if (dayOfWeek === 5) {
        var start = new Date(year, month, d, 18, 0, 0);
        var end = new Date(year, month, d, 22, 0, 0);
        events.push({
          id: 'smash-fri-' + year + '-' + (month + 1) + '-' + d,
          title: 'Friday Night Smash',
          description: 'Back Alley Burgers flying off the grill. Walk-ins welcome. Patio open weather permitting.',
          startsAt: start.toISOString(),
          endsAt: end.toISOString(),
          imageUrl: '../assets/images/venue/venue-4.jpg',
          published: true
        });
      }

      // Saturday: Live Local Night
      if (dayOfWeek === 6) {
        var start = new Date(year, month, d, 19, 30, 0);
        var end = new Date(year, month, d, 23, 0, 0);
        events.push({
          id: 'live-sat-' + year + '-' + (month + 1) + '-' + d,
          title: 'Live Local Night',
          description: 'Acoustic sets on the floor, smash burgers on the grill. No cover. Call ahead for larger groups.',
          startsAt: start.toISOString(),
          endsAt: end.toISOString(),
          imageUrl: '../assets/images/venue/venue-2.jpg',
          published: true
        });
      }
    }
    return events;
  }

  var MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  var state = {
    currentDate: new Date(),
    displayedMonth: new Date().getMonth(),
    displayedYear: new Date().getFullYear(),
    events: [],
    activeEvent: null
  };

  state.events = generateDefaultEvents(state.displayedYear, state.displayedMonth);

  function fetchRemoteEvents() {
    var from = new Date(state.displayedYear, state.displayedMonth, 1).toISOString();
    var to = new Date(state.displayedYear, state.displayedMonth + 1, 0, 23, 59, 59).toISOString();
    fetch('/api/events?from=' + encodeURIComponent(from) + '&to=' + encodeURIComponent(to))
      .then(function (res) {
        if (!res.ok) throw new Error('No API');
        return res.json();
      })
      .then(function (data) {
        if (data && Array.isArray(data.events) && data.events.length > 0) {
          state.events = data.events;
          renderCalendar();
        }
      })
      .catch(function () {
        // Fallback to default generated events
      });
  }

  function formatTime(isoString) {
    if (!isoString) return '';
    var d = new Date(isoString);
    var hours = d.getHours();
    var minutes = d.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    var minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return hours + (minutes === 0 ? '' : ':' + minutesStr) + ampm;
  }

  function formatDateHeading(isoString) {
    var d = new Date(isoString);
    var dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return dayNames[d.getDay()] + ', ' + MONTH_NAMES[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
  }

  function getEventsForDate(year, month, day) {
    return state.events.filter(function (e) {
      var ed = new Date(e.startsAt);
      return ed.getFullYear() === year && ed.getMonth() === month && ed.getDate() === day;
    });
  }

  function renderCalendar() {
    var monthEl = document.getElementById('evMonthTitle');
    if (monthEl) {
      monthEl.textContent = MONTH_NAMES[state.displayedMonth] + ' ' + state.displayedYear;
    }

    var gridEl = document.getElementById('evGrid');
    if (!gridEl) return;
    gridEl.innerHTML = '';

    var firstDayOfMonth = new Date(state.displayedYear, state.displayedMonth, 1).getDay();
    var daysInMonth = new Date(state.displayedYear, state.displayedMonth + 1, 0).getDate();
    var prevMonthDays = new Date(state.displayedYear, state.displayedMonth, 0).getDate();

    var today = new Date();
    var isCurrentMonth = today.getFullYear() === state.displayedYear && today.getMonth() === state.displayedMonth;

    // Previous month leading days
    for (var i = firstDayOfMonth - 1; i >= 0; i--) {
      var prevDayNum = prevMonthDays - i;
      var dayBtn = document.createElement('div');
      dayBtn.className = 'ev-day is-outside';
      dayBtn.innerHTML = '<span class="ev-day-num">' + prevDayNum + '</span>';
      gridEl.appendChild(dayBtn);
    }

    // Current month days
    for (var day = 1; day <= daysInMonth; day++) {
      var dayEvents = getEventsForDate(state.displayedYear, state.displayedMonth, day);
      var isToday = isCurrentMonth && today.getDate() === day;
      var hasEvents = dayEvents.length > 0;

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ev-day' + (hasEvents ? ' has-event' : '') + (isToday ? ' is-today' : '');
      btn.setAttribute('data-day', day);

      var html = '<span class="ev-day-num' + (isToday ? ' is-today-num' : '') + '">' + day + '</span>';
      if (hasEvents) {
        html += '<div class="ev-day-preview">' + escapeHtml(dayEvents[0].title) + '</div>';
        html += '<div class="ev-day-dots">';
        for (var k = 0; k < Math.min(dayEvents.length, 3); k++) {
          html += '<span class="ev-day-dot"></span>';
        }
        html += '</div>';
      }
      btn.innerHTML = html;

      if (hasEvents) {
        (function (evList) {
          btn.addEventListener('click', function () {
            openEventModal(evList[0]);
          });
        })(dayEvents);
      }

      gridEl.appendChild(btn);
    }

    // Trailing days
    var totalCells = firstDayOfMonth + daysInMonth;
    var nextMonthDays = (7 - (totalCells % 7)) % 7;
    for (var j = 1; j <= nextMonthDays; j++) {
      var nextBtn = document.createElement('div');
      nextBtn.className = 'ev-day is-outside';
      nextBtn.innerHTML = '<span class="ev-day-num">' + j + '</span>';
      gridEl.appendChild(nextBtn);
    }

    renderUpcomingList();
  }

  function renderUpcomingList() {
    var listEl = document.getElementById('evUpcomingList');
    if (!listEl) return;

    var sorted = state.events.slice().sort(function (a, b) {
      return new Date(a.startsAt) - new Date(b.startsAt);
    });

    var filtered = sorted.filter(function (e) {
      var ed = new Date(e.startsAt);
      return ed.getFullYear() === state.displayedYear && ed.getMonth() === state.displayedMonth;
    });

    if (filtered.length === 0) {
      listEl.innerHTML = '<p class="ev-empty">No special events scheduled for this month. Check back soon!</p>';
      return;
    }

    var html = '';
    filtered.forEach(function (e) {
      var d = new Date(e.startsAt);
      var timeStr = formatTime(e.startsAt) + (e.endsAt ? ' – ' + formatTime(e.endsAt) : '');

      html += '<article class="ev-card" role="button" tabindex="0" data-event-id="' + escapeHtml(e.id) + '">';
      html += '  <div class="ev-card-date">';
      html += '    <span class="ev-card-month">' + MONTH_NAMES[d.getMonth()].slice(0, 3) + '</span>';
      html += '    <span class="ev-card-day">' + d.getDate() + '</span>';
      html += '  </div>';
      html += '  <div class="ev-card-content">';
      html += '    <div class="ev-card-time">' + escapeHtml(timeStr) + '</div>';
      html += '    <h3 class="ev-card-title">' + escapeHtml(e.title) + '</h3>';
      html += '    <p class="ev-card-desc">' + escapeHtml(e.description) + '</p>';
      html += '  </div>';
      html += '</article>';
    });

    listEl.innerHTML = html;

    var cards = listEl.querySelectorAll('.ev-card');
    cards.forEach(function (card) {
      var id = card.getAttribute('data-event-id');
      var ev = state.events.find(function (item) { return item.id === id; });
      if (ev) {
        card.addEventListener('click', function () {
          openEventModal(ev);
        });
        card.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openEventModal(ev);
          }
        });
      }
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }

  function openEventModal(eventItem) {
    var modal = document.getElementById('evModal');
    if (!modal) return;

    var titleEl = document.getElementById('evModalTitle');
    var dateEl = document.getElementById('evModalDate');
    var timeEl = document.getElementById('evModalTime');
    var descEl = document.getElementById('evModalDesc');
    var imgEl = document.getElementById('evModalImg');
    var icalBtn = document.getElementById('evModalIcal');

    if (titleEl) titleEl.textContent = eventItem.title;
    if (dateEl) dateEl.textContent = formatDateHeading(eventItem.startsAt);
    if (timeEl) {
      var timeStr = formatTime(eventItem.startsAt) + (eventItem.endsAt ? ' – ' + formatTime(eventItem.endsAt) : '');
      timeEl.textContent = timeStr;
    }
    if (descEl) descEl.textContent = eventItem.description;
    if (imgEl) {
      imgEl.src = eventItem.imageUrl || '../assets/images/venue/venue-4.jpg';
      imgEl.alt = eventItem.title;
    }

    if (icalBtn) {
      icalBtn.onclick = function () {
        downloadIcs(eventItem);
      };
    }

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeEventModal() {
    var modal = document.getElementById('evModal');
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function downloadIcs(e) {
    var start = new Date(e.startsAt).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    var end = e.endsAt ? new Date(e.endsAt).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '') : start;
    var icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Bottomz Up Bar & Grill//Events//EN',
      'BEGIN:VEVENT',
      'UID:' + e.id + '@bottomzup',
      'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''),
      'DTSTART:' + start,
      'DTEND:' + end,
      'SUMMARY:' + e.title,
      'DESCRIPTION:' + e.description,
      'LOCATION:Bottomz Up Bar & Grill, 2001 Seymour Dr, South Boston, VA 24592',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    var blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8;' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = e.title.toLowerCase().replace(/[^a-z0-9]/g, '-') + '.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var prevBtn = document.getElementById('evPrevMonth');
    var nextBtn = document.getElementById('evNextMonth');
    var todayBtn = document.getElementById('evTodayBtn');

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        state.displayedMonth--;
        if (state.displayedMonth < 0) {
          state.displayedMonth = 11;
          state.displayedYear--;
        }
        state.events = generateDefaultEvents(state.displayedYear, state.displayedMonth);
        renderCalendar();
        fetchRemoteEvents();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        state.displayedMonth++;
        if (state.displayedMonth > 11) {
          state.displayedMonth = 0;
          state.displayedYear++;
        }
        state.events = generateDefaultEvents(state.displayedYear, state.displayedMonth);
        renderCalendar();
        fetchRemoteEvents();
      });
    }

    if (todayBtn) {
      todayBtn.addEventListener('click', function () {
        var now = new Date();
        state.displayedMonth = now.getMonth();
        state.displayedYear = now.getFullYear();
        state.events = generateDefaultEvents(state.displayedYear, state.displayedMonth);
        renderCalendar();
        fetchRemoteEvents();
      });
    }

    var modalCloseBtn = document.getElementById('evModalClose');
    var modalBackdrop = document.getElementById('evModalBackdrop');
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeEventModal);
    if (modalBackdrop) modalBackdrop.addEventListener('click', closeEventModal);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeEventModal();
    });

    renderCalendar();
    fetchRemoteEvents();
  });
})();
