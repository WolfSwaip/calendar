var globOffsetMonth = 0;// Смещение по месяцам

$( document ).ready(() => {

  // Выводим календарь с нулевым смещением (текущий месяц)
  createCalendar(globOffsetMonth);

  // Нажатие на стрелку "Назад"
  $( document ).on( "click", ".arrowr", () => {
    createCalendar(-1);// Вызываем перерисовку календаря со смещением на один месяц назад
  });

  // Нажатие на стрелку "Вперёд"
  $( document ).on( "click", ".arrowl", () => {
    createCalendar(1);// Вызываем перерисовку календаря со смещением на один месяц вперёд
  });

  // Нажатие на ячейку с датой
  $( document ).on( "click", ".num", (event) => {
    var months = new Array("Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь");
    $( ".num" ).removeClass( "active" );
    $(event.target).addClass( "active" );// Выбранная дата
    var dStr = $(event.target).attr( "data-id");// Получаем id даты
    var mandy = $( ".month" ).html().split(" ");// Получаем строку с месяцем и годом
    var d = event.target.innerHTML;
    var m = mandy[0];// Месяц
    var y = mandy[1];// Год
    // Получаем строку с полной датой (число, месяц, год)
    var str = getFullDate(d, m, y);
    $( ".full-date" ).attr( "data-dstr", dStr );// Запоминаем id даты на будущее
    $( ".full-date" ).html(str);// Показываем полную выбранную дату
  });

  // Нажатие на кпопку с событиями
  $( document ).on( "click", ".more", () => {
    var a = $( ".full-date" ).html();
    var id = $( ".full-date" ).attr( "data-dstr" );
    var flagEvent = false;// Есть ли события у этой даты
    var len = 0;// Кол-во выведенных событий
    $( ".event-date" ).html(a);
    $( ".edit-event" ).fadeIn(200);// Показываем окно с событиями
    $( ".cal" ).hide();// Скрываем календарь
    $( ".close" ).css( {borderTopRightRadius: "10px"} );
    // Получаем и парсим объект с событиями
    if (localStorage.getItem("events")) {
      var retObj = JSON.parse(localStorage.getItem("events"));
      for (var item in retObj) {
        // Если есть события на выбранную дату
        if (retObj[item].id === id) {
          var cl = "";
          len++;
          // Если описание пустое, не подчёркиваем его
          if (retObj[item].desc !== "") cl = "bor";
          $( ".event-list" ).append( "<div class='event-block'  data-ev="+item+"><span class='del' data-ev="+item+">&#10008;</span><p class='bor'>"+retObj[item].name+"</p><p class="+cl+">"+retObj[item].desc+"</p></div>" );
          flagEvent = true;
        }
      }
      // Выполняем манипуляции с элементами
      if (flagEvent){
        $( ".name" ).hide();
        $( ".desc" ).hide();
        $( ".save" ).hide();
        $( ".add" ).show();
        $( ".event-list" ).show();
        $( ".event-list" ).attr( "data-len", len );
        // Если высота окна со всеми событиями больше 300px
        if ($( ".event-list" ).height() > 300) {
          // Увеличиваем окно и показываем скролл
          $( ".edit-event" ).css( {overflow: "auto"} );
          $( ".close" ).css( {borderRadius: "0px"} );
          $( ".event-date" ).css( {width: "66%"} );
        }
      }
    }

  });

  // Нажатие на кпопку закрытия экрана с событиями
  $( document ).on( "click", ".close", () => {
    $( ".cal" ).show();
    $( ".edit-event" ).hide();
    $( ".event-block" ).remove();
    $( ".event-block" ).hide();
    $( ".name" ).show();
    $( ".desc" ).show();
    $( ".save" ).show();
    $( ".add" ).hide();
    $( ".name" ).css( {borderBottom: "1px solid #ccc", transition: "1s"} );
  });

  // Нажатие на кпопку добавления нового события
  $( document ).on( "click", ".add", () => {
    $( ".event-block" ).empty();
    $( ".event-block" ).hide();
    $( ".name" ).fadeIn();
    $( ".desc" ).fadeIn();
    $( ".save" ).show();
    $( ".add" ).hide();
  });

  // Нажимаем на кнопку удаления события
  $( document ).on( "click", ".del", (event) => {
    var delId = $(event.target).attr( "data-ev" );// id удаляемого события
    var curEl = $( ".event-block[data-ev='" + delId +"']" );// Ищим блок с этим событием
    curEl.fadeOut(200);// Скрываем его
    // Если размер окна меньше 800
    if ($( ".event-list" ).height() < 1200) {
      // Уменьшаем окно и убираем скролл
      $( ".event-date" ).css( {width: "68.5%", transition: "0.5s"} );
      $( ".edit-event" ).css( {overflow: "none", transition: "0.5s"} );
      $( ".close" ).css( {borderTopRightRadius: "10px"} );
    }
    // Поучаем и парсим события
    var retObj = JSON.parse(localStorage.getItem("events"));
    delete retObj[delId];/// Удаляем объект с событием
    localStorage.setItem("events", JSON.stringify(retObj));
    // Смотрим, сколько событий осталось у данного дня
    var len = $( ".event-list" ).attr( "data-len" );
    len--;
    $( ".event-list" ).attr( "data-len", len);
    // Если событий больше нет, снимаем выделение
    if(len === 0) {
      var a = $( ".full-date" ).attr( "data-dstr");
      var b = $( ".num[data-id='" + a +"']" );
      b.removeClass( "event" );
    }
  });

  // Нажатие на кнопку сохранения события
  $( document ).on( "click", ".save", () => {
    var name = $( ".name" ).val();// Название события
    var desc = $( ".desc" ).val();// Описание события
    var date = $( ".full-date" ).attr( "data-dstr" );// Дата формата dmyyyy
    /* Название события - обязательное поле
       Если ничего не введено - окрашиваем границы в красный
       Иначе обычный цвет границ*/
    if (name === "")
      $( ".name" ).css( {borderBottom: "1px solid red", transition: "1s"} );
    else {
      $( ".name" ).css( {borderBottom: "1px solid #ccc", transition: "1s"} );
      // Очищаем поля с данными
      $( ".name" ).val("");
      $( ".desc" ).val("");
      var clickDate = $( ".full-date" ).attr( "data-dstr" );
      if (localStorage.getItem("events")) {
        // Добавляем новое событие
        var retObj = JSON.parse(localStorage.getItem("events"));
        retObj.count++;
        var q = "event_" + retObj.count;
        retObj[q] = {
          "id"   : date,
          "name" : name,
          "desc" : desc
        };
        localStorage.setItem("events", JSON.stringify(retObj));
      }
      // Если локальное хранилище пустое
      else {
        var newObj = {
            "count" : 1,
            "event_1" : {
              "id"    : date,
              "name"  : name,
              "desc"  : desc
            }
        };
        localStorage.setItem("events", JSON.stringify(newObj));
      }
      $( ".edit-event" ).fadeOut(200);
      var curEl = $( ".num[data-id='" + date +"']" );
      curEl.removeClass( "active" );
      curEl.addClass( "event" );// Добавляем выделение зелёным цветом
      $( ".cal" ).show();
    }

  });

});

function getFullDate(d, m, y) {
  // Меняем окончание месяца (январь -> января,..)
  if (m[m.length - 1] === "ь") m = m.replace("ь", "я");
  else if (m[m.length - 1] === "т") m = m.replace("т", "та");
  else if (m[m.length - 1] === "й") m = m.replace("й", "я");
  var clickDate = d + " " + m + " " + y + " года";// Составляем строку с полной датой (число, месяц, год)
  return clickDate;
}

// Функция вычисления необходимых значений. На вход смещение. Возвращает объект
function dateInfo(offset) {

  globOffsetMonth += offset;// Изменяем глобальное смещение по месяцам
  var months = new Array("Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь");
  var date = new Date();// Новый объект
  var year = date.getFullYear();// Год
  var curYear = year;// Сохраняем текущий год
  var month = date.getUTCMonth();// Номер месяца
  var curMonthStr = months[month];// Название текущего месяца
  var today = date.getDate();// Номер текущего дня

  month += globOffsetMonth;// Смещаем месяц

  var firstDay = new Date(year, month, 0);// Первый день текущего месяца
  var firstWeekDay = firstDay.getDay();// День недели первого дня текущего месяца
  firstWeekDay += 1;
  // Вычисляем количество дней в текущем месяца
  var lastDate = new Date(year, month + 1, 0).getDate();
  var mc = firstDay.getUTCMonth()+1;// Номер месяца
  var mStr = months[mc];// Название месяца
  var newY = firstDay.getFullYear();// Год
  if (typeof mStr === "undefined") {
    mc = 0;
    mStr = months[mc];
  }
  // Кол-во дней в предыдущем месяце
  var prevCount = firstDay.getDate();

  // Объект с необходимыми данными
  var res = {
    "mc"            : mc,
    "year"          : newY,
    "mStr"          : mStr,
    "firstWeekDay"  : firstWeekDay,
    "lastDate"      : lastDate,
    "today"         : today,
    "curMonthStr"   : curMonthStr,
    "curYear"       : curYear,
    "prevCount"     : prevCount
  };

  return res;

}

function createCalendar(offset) {

  var info = dateInfo(offset);
  var clickDate;// Число, месяц, год выбранной даты
  var clickDay;// Число выбранной даты

  $( ".cal" ).empty();//Очищаем календарь
  //Добавляе стрелки и месяцы
  $( ".cal" ).append( "<tr><td class='arrowr'>&lt;</td>" +
                      "<td class='month' colspan=5>" + info.mStr + " " + info.year + "</td>" +
                      "<td class='arrowl'>&gt;</td></tr>" );
  $( ".cal" ).append( "<tr><td class='hr' colspan=7><hr></td></tr>" );
  // Добавляем дни недели
  $( ".cal" ).append( "<tr class='sub'><td>ПН</td><td>ВТ</td><td>СР</td><td>ЧТ</td><td>ПТ</td><td style='color: #d21f1f;;'>СБ</td><td style='color: #d21f1f;'>ВС</td></tr>" );
  $( ".cal" ).append( "<tr><td class='hr' colspan=7><hr></td></tr>" );
  var printedCount = 0;// Количество выведенных чисел (нужно для перехода на новую неделю)
  var d = 0;// Число месяца
  var mas = [];// Массив, содержащий id дней с обытиями
  var evObj;
  var len = 0;
  if (localStorage.getItem("events"))
    evObj = JSON.parse(localStorage.getItem("events"));

  for(var w in evObj){
    // id хранятся в массиве в единственном экземляре, чтобы не повторялись
    if(mas.indexOf(evObj[w].id) === -1){
      mas[len] = evObj[w].id;
      len++;
    }
  }

  $( ".cal" ).append( "<tr>" );// Открываем новую строку
  for (var i = 1; i < info.lastDate + info.firstWeekDay; i++) {
    // Если выведенно количество равно или болшее дня недели первого дня месяа
    if (i >= info.firstWeekDay) {
      d = i - info.firstWeekDay + 1;// Высчитываем число
      var m = info.mc + 1;
      var dId = d + "" + m + "" + info.year;
      //Если выводим текущее число, окрашиваем ячейку в другой цвет
      if (info.mStr === info.curMonthStr && info.year === info.curYear && info.today === d)
        $( ".cal" ).append( "<td class='num tod' data-id="+dId+">" + d + "</td>" );
      else if(mas.indexOf(dId) !== -1)
        $( ".cal" ).append( "<td class='num event' data-id="+dId+">" + d + "</td>" );
      else
        $( ".cal" ).append( "<td class='num' data-id="+dId+">" + d + "</td>" );
      printedCount++;// Увеличиваем кол-во выведенных чисел
      // Если вывели 7 дней, переходим на новую строку
      if (printedCount === 7) {
        $( ".cal" ).append( "</tr>" );
        $( ".cal" ).append( "<tr>" );
        printedCount = 0;
      }
    // Выводим дни предыдущего мысяца
    } else {
      var k = info.prevCount - info.firstWeekDay + i + 1;
      $( ".cal" ).append( "<td class='d-hide'>"+k+"</td>" );
      printedCount++;
    }
  }

  // Выводим дни следующего месяца
  for(var p = 1; p < (44 - info.lastDate - info.firstWeekDay); p++){
    $( ".cal" ).append( "<td class='d-hide'>"+p+"</td>" );
    printedCount++;
    if (printedCount === 7) {
      $( ".cal" ).append( "</tr>" );
      $( ".cal" ).append( "<tr>" );
      printedCount = 0;
    }
  }

  // Добавляем дату и кнопку для работы с событиями
  $( ".cal" ).append( "<tr><td class='hr' colspan=7><hr></td></tr>" );
  $( ".cal" ).append( "<tr><td></td><td class='full-date' data-dstr='0' colspan=5>"+str+"</td><td class='more' colspan=1>&#9998;</td></tr>" );

  var str = getFullDate(info.today, info.curMonthStr, info.curYear);
  var mc = info.mc;
  mc += 1;
  var dStr = info.today + "" + mc + "" + info.year;
  $( ".full-date" ).attr( 'data-dstr', dStr );
  $( ".full-date" ).html(str);
  $( ".event-date" ).html(str);

}
