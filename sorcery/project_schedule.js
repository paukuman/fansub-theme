// Schedule Manager Class
class ScheduleManager {
  constructor() {
    this.currentWeekOffset = 0;
    this.scheduleData = [];
    this.selectedDay = null;
    this.init();
  }

  init() {
    this.loadScheduleData();
    this.setupEventListeners();
  }

  async loadScheduleData() {
    try {
      document.getElementById('schedule-loading').classList.remove('hidden');
      document.getElementById('schedule-content').classList.add('hidden');
      document.getElementById('schedule-error').classList.add('hidden');

      const blogID = document.querySelector('meta[name="blogID"]')?.content || '';
      const apiUrl = `https://mangadb.paukuman.workers.dev/anime?blogID=${blogID}&genre=scheduled:true&page=animeinfo`;

      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error('Failed to fetch schedule data');

      const data = await response.json();

      if (data.status === 200 && data.response && data.response.entries) {
        this.scheduleData = data.response.entries;
        this.renderSchedule();
      } else {
        throw new Error('Invalid data format');
      }
    } catch (error) {
      console.error('Error loading schedule:', error);
      document.getElementById('schedule-loading').classList.add('hidden');
      document.getElementById('schedule-error').classList.remove('hidden');
    }
  }

  setupEventListeners() {
    document.getElementById('prev-week').addEventListener('click', () => {
      this.currentWeekOffset--;
      this.renderSchedule();
    });

    document.getElementById('next-week').addEventListener('click', () => {
      this.currentWeekOffset++;
      this.renderSchedule();
    });

    document.getElementById('current-week').addEventListener('click', () => {
      this.currentWeekOffset = 0;
      this.renderSchedule();
    });

    document.getElementById('retry-schedule').addEventListener('click', () => {
      this.loadScheduleData();
    });
  }

  parseScheduleTime(categories) {
    const scheduleTime = categories.find(cat => cat.startsWith('scheduled_time:') || cat.startsWith('sheduled_time:'));
    if (!scheduleTime) return null;

    const timePart = scheduleTime.split(':')[1];
    const [day, time] = timePart.split('|');

    return {
      day: parseInt(day),
      time: time
    };
  }

  getWeekDates(weekOffset = 0) {
    const now = new Date();
    const currentDay = now.getDay(); // 0 (Sunday) to 6 (Saturday)
    const currentDate = now.getDate();

    // Calculate Monday of this week
    const monday = new Date(now);
    monday.setDate(currentDate - currentDay + (currentDay === 0 ? -6 : 1));

    // Apply week offset
    monday.setDate(monday.getDate() + (weekOffset * 7));

    // Generate all days of the week
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      weekDates.push(date);
    }

    return weekDates;
  }

  getAnimeForDay(day) {
    return this.scheduleData.filter(anime => {
      const scheduleTime = this.parseScheduleTime(anime.categories);
      return scheduleTime && scheduleTime.day === day;
    });
  }

  formatTime(timeStr) {
    if (!timeStr) return 'Time TBA';

    // Format "HH.MM" to "HH:MM"
    const [hours, minutes] = timeStr.split('.');
    const formattedTime = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;

    // Add AM/PM for better readability
    const hourNum = parseInt(hours);
    const period = hourNum >= 12 ? 'PM' : 'AM';
    const displayHour = hourNum % 12 || 12;

    return `${displayHour}:${minutes} ${period}`;
  }

  getDayName(dayIndex) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days[dayIndex - 1] || 'Unknown';
  }

  getShortDayName(dayIndex) {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days[dayIndex - 1] || 'Unknown';
  }

  getFormattedWeekRange(dates) {
    const firstDate = dates[0];
    const lastDate = dates[dates.length - 1];

    const firstMonth = firstDate.toLocaleString('default', { month: 'short' });
    const lastMonth = lastDate.toLocaleString('default', { month: 'short' });

    if (firstMonth === lastMonth) {
      return `${firstMonth} ${firstDate.getDate()} - ${lastDate.getDate()}, ${lastDate.getFullYear()}`;
    } else {
      return `${firstMonth} ${firstDate.getDate()} - ${lastMonth} ${lastDate.getDate()}, ${lastDate.getFullYear()}`;
    }
  }

  updateSelectedDayInfo(day, count, date) {
    document.getElementById('selected-day-name').textContent = day ? this.getDayName(day) : 'Select a day';
    document.getElementById('selected-day-date').textContent = day ? date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '';

    const countElement = document.getElementById('selected-day-count');
    if (count > 0) {
      countElement.textContent = `${count} anime scheduled`;
      countElement.className = 'text-sm text-green-600 dark:text-green-400';
    } else if (day) {
      countElement.textContent = 'No anime scheduled';
      countElement.className = 'text-sm text-gray-600 dark:text-gray-400';
    } else {
      countElement.textContent = '0 anime scheduled';
      countElement.className = 'text-sm text-gray-600 dark:text-gray-400';
    }
  }

  renderSchedule() {
    if (!this.scheduleData.length) return;

    const weekDates = this.getWeekDates(this.currentWeekOffset);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Update week display
    document.getElementById('current-week-display').textContent = this.getFormattedWeekRange(weekDates);

    // Count anime per day
    const animeCountByDay = {};
    for (let day = 1; day <= 7; day++) {
      animeCountByDay[day] = this.getAnimeForDay(day).length;
    }

    // Render day badges
    const badgesContainer = document.getElementById('day-badges');
    badgesContainer.innerHTML = weekDates.map((date, index) => {
      const dayOfWeek = index + 1; // Monday = 1, Sunday = 7
      const count = animeCountByDay[dayOfWeek] || 0;
      const isToday = date.getTime() === today.getTime();
      const isEmpty = count === 0;

      return `
        <div class="day-badge ${isEmpty ? 'empty' : 'has-content'} ${isToday ? 'today' : ''} ${this.selectedDay === dayOfWeek ? 'active' : ''}" 
             data-day="${dayOfWeek}" data-date="${date.toISOString()}">
          <div class="day-name ${isToday ? 'text-orange-600 dark:text-orange-400' : 'text-gray-600 dark:text-gray-400'}">
            ${this.getShortDayName(dayOfWeek)}
          </div>
          <div class="day-number ${isToday ? 'text-orange-700 dark:text-orange-300' : 'text-gray-700 dark:text-gray-300'}">
            ${date.getDate()}
          </div>
          <div class="day-count ${isEmpty ? 'empty' : 'has-content'}">
            ${count}
          </div>
        </div>
      `;
    }).join('');

    // Add click events to badges
    badgesContainer.querySelectorAll('.day-badge:not(.empty)').forEach(badge => {
      badge.addEventListener('click', () => {
        const day = parseInt(badge.dataset.day);
        const date = new Date(badge.dataset.date);

        // Remove active class from all badges
        badgesContainer.querySelectorAll('.day-badge').forEach(b => {
          b.classList.remove('active');
        });

        // Add active class to clicked badge
        badge.classList.add('active');

        // Update selected day
        this.selectedDay = day;

        // Render list for this day
        this.renderScheduleList(day, date);
      });
    });

    // Auto-select today if it's the current week and has content
    if (this.currentWeekOffset === 0) {
      const currentDay = today.getDay();
      const adjustedDay = currentDay === 0 ? 7 : currentDay;

      const todayBadge = badgesContainer.querySelector(`.day-badge[data-day="${adjustedDay}"]`);
      if (todayBadge && !todayBadge.classList.contains('empty')) {
        todayBadge.click();
      } else if (todayBadge && todayBadge.classList.contains('empty')) {
        this.updateSelectedDayInfo(adjustedDay, 0, weekDates[adjustedDay - 1]);
      }
    }

    // Show content
    document.getElementById('schedule-loading').classList.add('hidden');
    document.getElementById('schedule-content').classList.remove('hidden');
  }

  renderScheduleList(day, date) {
    const animeList = this.getAnimeForDay(day);
    const container = document.getElementById('schedule-list');

    // Update selected day info
    this.updateSelectedDayInfo(day, animeList.length, date);

    if (animeList.length === 0) {
      container.innerHTML = `
        <div class="col-span-full text-center py-12 text-gray-400 dark:text-gray-500">
          <i class="fas fa-calendar-plus text-4xl mb-3"></i>
          <p>No anime scheduled for ${this.getDayName(day)}</p>
          <p class="text-sm mt-2">Check back later for updates</p>
        </div>
      `;
      return;
    }

    container.innerHTML = animeList.map((anime, index) => {
      const scheduleTime = this.parseScheduleTime(anime.categories);
      const imageUrl = this.extractCoverImage(anime.content);
      const score = anime.categories.find(cat => cat.startsWith('rate:'))?.split(':')[1] || 'N/A';
      const status = anime.categories.find(cat => cat.startsWith('status:'))?.split(':')[1] || 'unknown';

      return `
        <div class="schedule-item glass rounded-lg p-4 hover:shadow-lg transition-all" style="animation-delay: ${index * 0.1}s">
          <div class="flex items-start space-x-3">
            ${imageUrl ? `
              <div class="flex-shrink-0 w-16 h-20 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                <img src="${imageUrl}" alt="${anime.title}" class="w-full h-full object-cover">
              </div>
            ` : `
              <div class="flex-shrink-0 w-16 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded flex items-center justify-center text-white">
                <i class="fas fa-film"></i>
              </div>
            `}
            
            <div class="flex-1 min-w-0">
              <h5 class="font-medium text-sm line-clamp-2 mb-1">${anime.title}</h5>
              
              <div class="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400 mb-2">
                <span class="flex items-center">
                  <i class="fas fa-star text-yellow-500 mr-1"></i> ${score}
                </span>
                <span>•</span>
                <span class="time-badge">
                  <i class="fas fa-clock mr-1"></i> ${this.formatTime(scheduleTime?.time)}
                </span>
              </div>
              
              <div class="text-xs mb-2">
                <span class="inline-block px-2 py-1 rounded-full ${this.getStatusClass(status)}">
                  ${this.formatStatus(status)}
                </span>
              </div>
              
              <a href="${anime.path}" class="inline-flex items-center text-xs text-primary-600 dark:text-primary-400 hover:underline mt-2">
                <i class="fas fa-external-link-alt mr-1"></i> View details
              </a>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  getStatusClass(status) {
    const statusClasses = {
      'ongoing': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'upcoming': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    };

    return statusClasses[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }

  formatStatus(status) {
    const statusMap = {
      'ongoing': 'Ongoing',
      'completed': 'Completed',
      'upcoming': 'Upcoming'
    };

    return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
  }

  extractCoverImage(content) {
    if (!content) return null;
    const match = content.match(/src="([^"]+)"/);
    return match ? match[1] : null;
  }
}

// Initialize schedule manager when page loads
/*document.addEventListener('DOMContentLoaded', () => {
  new ScheduleManager();
});*/


new ScheduleManager();