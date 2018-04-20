$(function() {

    const app = (function($) {

        const navBtns = $('.nav a');
        const section = $('section');
        const url = 'https://api.nbp.pl/api/exchangerates/tables/a/?format=json';
        const pln = { currency: 'złoty', code: 'PLN', mid: 1 };
        const body = $('body');
        const thTableBtnDown = $('.th-table-button-down');
        const thTableBtnUp = $('.th-table-button-up');
        const select = $('.select');
        const selectList = $('.select-values');
        const regex = /^[0-9]*\.?[0-9]*$/;
        const btnConvert = $('button.convert');
        const btnResultsSwitch = $('.btn--results');
        const btnGenerateList = $('button.generate');
        let scrolled = 0, thTableInHeight, maxScroll, arr = [];
        let selectFromDataMid = 1, selectFromDataCode = 'PLN', selectToDataMid = 1, selectToDataCode = 'PLN';

        // Firebase data config ------------------------
        const config = {
            apiKey: "AIzaSyBJMUVwgHG3mFs8jhfC2nruaCV8LO7Simg",
            authDomain: "kalkulator-walut-70025.firebaseapp.com",
            databaseURL: "https://kalkulator-walut-70025.firebaseio.com",
            projectId: "kalkulator-walut-70025",
            storageBucket: "",
            messagingSenderId: "642311339833"
        };
        const app = firebase.initializeApp(config);
        const history = app.database().ref('history');
        // ---------------------------------------------

        // Date generator ------------------------------
        getDate = () => {
            const newDate = new Date();
            const days = ["Niedziela", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota"];
            const months = ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"];
            const hours = newDate.getHours() < 10 ? "0" + newDate.getHours() : newDate.getHours();
            const minutes = newDate.getMinutes() < 10 ? "0" + newDate.getMinutes() : newDate.getMinutes();
            const seconds = newDate.getSeconds() < 10 ? "0" + newDate.getSeconds() : newDate.getSeconds();
            const date = `${days[newDate.getDay()]}, ${newDate.getDate()} ${months[newDate.getMonth()]} - ${hours}:${minutes}:${seconds}`;
            return date;
        }
        // ---------------------------------------------

        minHeight = () => $('.col--top-right').css('min-height', $('.col--top-left').outerHeight());
        resize = () => $(window).on('resize', minHeight);

        navigation = () => {
            navBtns.on('click', function(event) {
                event.preventDefault();
                const page = $(this).attr('data-page');
                navBtns.removeClass('active');
                $(this).addClass('active');
                section.hide().css('opacity', '0');
                $(`section[data-page="${page}"`).show().animate({'opacity' : '1'}, 100);
                if (page === 'page-one') { generateList($('.chartist--inputs').find('.select-text').attr('data-code'));}
                else { getHistory(10); };
            });
        }

        setTimeout(() => {
            $('section[data-page="page-one"]').animate({'opacity' : '1'}, 300);
        }, 300);

        // get data onload ->
        getDataRates = () => {
            $.ajax({
                url: url,
                dataType: 'json',
                method: 'GET'
            }).done(function(data) {

                $('.small-top-text-date').text(`${data[0].effectiveDate}`);

                const addPln = [pln, ...data[0].rates];
                arr = [];

                // push only 14 items to arr[]
                for (let i = 0; i < 14; i++) {
                    arr.push(addPln[i]);
                };

                $('.chartist--inputs .select-text').attr({'data-mid' : arr[2].mid, 'data-code' : arr[2].code}).text(`${arr[2].code} (${arr[2].currency})`);

                for (let i = 0; i < arr.length; i++) {
                    const selectDataLi = `<li data-mid=${arr[i].mid} data-code=${arr[i].code} data-currency=${arr[i].currency}><img class="flags" src="./flags/${arr[i].code}.png">${arr[i].code} (${arr[i].currency})</li>`;
                    $(selectDataLi).hide().appendTo('.select-values').fadeIn('slow');
                };

                for (let i = 1; i < 10; i++) {
                    const currencyTop = `<div class="th-table-in">
                                          <div class="th-table-in-top"><img class="flags" src="./flags/${arr[i].code}.png">${arr[i].code}</div>
                                          <div class="th-table-in-bottom">${arr[i].mid} PLN</div>
                                        </div>`;
                    $(currencyTop).hide().appendTo('.th-table-scrolled').fadeIn('slow');
                };

                minHeight();
                $('.chartist--inputs .select-values').find('li[data-code="PLN"]').remove();

            }).fail(function(error) {
                console.log(error);
            });
        };
        // -> get data onload end


        // select ->
        selectWrapper = () => {
            select.on('click', function() {
                if ($(this).parent().hasClass('active')) { $(this).parent().removeClass('active'); }
                else { select.parent().removeClass('active'); $(this).parent().addClass('active'); }
            });
        }

        selectedList = () => {
            selectList.each(function() {
                $(this).on('click', 'li', function() {
                    $(this).parent().parent().find('.select-text').text($(this).text())
                    thisDataMid = $(this).data('mid');
                    thisDataCode = $(this).data('code');
                    $(this).parent().parent().find('.select-text').attr('data-mid', thisDataMid);
                    $(this).parent().parent().find('.select-text').attr('data-code', thisDataCode);
                    $(this).parent().parent().find('.selected-flag').attr({'src' : `./flags/${thisDataCode}.png`, 'alt' : `${thisDataCode}`});
                    selectFromDataMid = $('.select-from .select-text').attr('data-mid'), selectFromDataCode = $('.select-from .select-text').attr('data-code');
                    selectToDataMid = $('.select-to .select-text').attr('data-mid'), selectToDataCode = $('.select-to .select-text').attr('data-code');
                });
            });
        }

        bodyEvents = () => {
            body.on('click', function(event) {
                if ($(event.target).parent().hasClass('active') || $(event.target).parent().hasClass('select')) {
                } else {
                    select.parent().removeClass('active');
                }
            });
        }
        // -> select end


        // th-table ->
        thTableScrolled = (scrolled) => {
            $('.th-table').stop().animate({
                scrollTop: scrolled
            });
        }

        // th-table-scrolled down button
        thTableScrolledDown = () => {
            thTableBtnDown.on('click', function() {
                thTableInHeight = $('.th-table-in').outerHeight();
                maxScroll = thTableInHeight * 6;
                scrolled === maxScroll ? scrolled = maxScroll : scrolled = scrolled + thTableInHeight;
                thTableScrolled(scrolled);
            });
        }

        // th-table-scrolled up button
        thTableScrolledUp = () => {
            thTableBtnUp.on('click', function() {
                thTableInHeight = $('.th-table-in').outerHeight();
                scrolled === 0 ? scrolled = 0 : scrolled = scrolled - thTableInHeight;
                thTableScrolled(scrolled);
            });
        };
        // -> th-table end


        // convert ->
        convertValue = () => {
            const inputValue = $('.inputValue').val();
            const inputValueMod = inputValue * 100 + 0.001;
            const inputValueModToFixed = inputValueMod.toFixed(0);
            const inputValueModLength = inputValueModToFixed.toString().length;
            const inputResult = inputValueMod.toString().substring(0, inputValueModLength-2) + "." + inputValueMod.toString().substring(inputValueModLength-2, inputValueModLength);
            const results = ((selectFromDataMid / selectToDataMid) * inputValue).toFixed(2);
            const bottomFromTxt = $('.select-from .select-text').text();
            const bottomToTxt = $('.select-to .select-text').text();

            if (inputValue.length === 0 || inputValue === '0') {

                $('.input-alert').css('display', 'inline-block').text('Podaj kwotę');
                $('.input').addClass('alert-border');

            } else if (!regex.test(inputValue)) {

                $('.input-alert').css('display', 'inline-block').text('Zła wartość');
                $('.input').addClass('alert-border');

            } else {

                $('.input-alert').css('display', 'none');
                $('.input').removeClass('alert-border');

                // push data to firebase -----
                historyValue = history.push({
                            valueSet          : inputResult + ' ' + selectFromDataCode,
                            valueSetCode      : bottomFromTxt.substring(5, bottomFromTxt.length-1),
                            valueSetBottom    : `1 ${selectFromDataCode} = ${((selectFromDataMid / selectToDataMid) * 1).toFixed(2)} ${selectToDataCode}`,
                            valueResult       : results + ' ' + selectToDataCode,
                            valueResultCode   : bottomToTxt.substring(5, bottomToTxt.length-1),
                            valueResultBottom : `1 ${selectToDataCode} = ${((selectToDataMid / selectFromDataMid) * 1).toFixed(2)} ${selectFromDataCode}`,
                            date              : getDate()
                        });
                // --------------------------

                const resultsDiv = `<div class="results latestResults">
                                      <div class="col-xs-12 col-sm-5">
                                        <div class="resultsTextLeft">${inputResult} ${selectFromDataCode}</div>
                                        <div class="resultsBottomTextLeft">${bottomFromTxt.substring(5, bottomFromTxt.length-1)}</div>
                                        <div class="resulstSmallTxt txt-right">1 ${selectFromDataCode} = ${((selectFromDataMid / selectToDataMid) * 1).toFixed(2)} ${selectToDataCode}</div>
                                      </div>
                                      <div class="col-xs-12 col-sm-2">
                                        <div class="resultsTextCenter">=</div>
                                      </div>
                                      <div class="col-xs-12 col-sm-5">
                                        <div class="resultsTextRight">${results} ${selectToDataCode}</div>
                                        <div class="resultsBottomTextRight">${bottomToTxt.substring(5, bottomToTxt.length-1)}</div>
                                        <div class="resulstSmallTxt txt-left">1 ${selectToDataCode} = ${((selectToDataMid / selectFromDataMid) * 1).toFixed(2)} ${selectFromDataCode}</div>
                                      </div>
                                    </div>`;

                $('.resultsZero').remove();
                $(resultsDiv).prependTo('.results-top');
                $('.latestResults:nth-of-type(2)').addClass('oldResults');
                $('.latestResults:nth-of-type(2)').prependTo('.results-bottom');
                $('.latestResults:nth-of-type(1n+2)').remove();

                if ($('.results-bottom').children().length > 0) {
                    $('.label-previous').css('display', 'inline-block');
                };

                // if convert new value switch to active results
                btnResultsSwitch.removeClass('active');
                $('.btn--results[data-result="1"]').addClass('active');
                $('.results-top').show();
                $('.results-bottom').hide();

            };
        }

        convert = () => {
            btnConvert.on('click', convertValue);
            btnResultsSwitch.on('click', function() {
                btnResultsSwitch.removeClass('active');
                $(this).addClass('active');
                if ($(this).attr('data-result') === '1') { $('.results-top').show(); $('.results-bottom').hide();
                } else {
                    $('.results-top').hide(); $('.results-bottom').show();
                }
            });
        }
        // -> convert end


        // tableList generate ->
        isPlusOrMinus = (a, b) => {
            return (a > b) ? '#0082CD' : 'red';
        }

        generateList = (code) => {
            const url = `https://api.nbp.pl/api/exchangerates/rates/a/${code}/last/10/?format=json`;
              $.ajax({
                  url: url,
                  dataType: 'json',
                  method: 'GET'
              }).done(function(data) {
                  arr = [];
                  const dane = data.rates;
                  const firstValue = data.rates[0].mid;
                  const lastValue = data.rates[9].mid;

                  dane.forEach(i => arr.push(i.mid));

                  let num1 = 0, num2 = 0;

                  is = (a, b) => {
                      if (a > b) { num1++; arrPlus = [num1+1]; } else { num2++; arrMinus = [num2]; };
                  }

                  for (let i = 1; i < dane.length; i++) {
                      is(data.rates[i].mid, data.rates[i-1].mid)
                  }

                  valueSum = (a, b) => {
                      if (a > b) {
                          return 'Spadek wartości o: ';
                      } else if (a < b) {
                          return 'Wzrost wartości o: ';
                      };
                      return 'Brak różnicy wartości: ';
                  }

                  calculateSum = (a, b) => {
                      if (a < b) { return true; }
                      return false;
                  }

                  calculatePercentage = (a, b) => {
                      if (a < b) { return '+' + (((b - a) / b) * 100).toString().substr(0, lastValue.toString().length) };
                      return '-' + (((a - b) / a) * 100).toString().substr(0, lastValue.toString().length);
                  }

                  setTimeout(() => {
                      $('.progress-bar-up').css('width', arrPlus * 10 - 0.1 + '%');
                      $('.progress-bar-down').css('width', arrMinus * 10 - 0.1 + '%');
                      $('.value-first').text(firstValue);
                      $('.value-last').text(lastValue);
                      $('.value-sum-text').text(valueSum(firstValue, lastValue));
                      $('.ct-series .ct-label').delay(1300).animate({'opacity' : '1'}, 800);
                      $('.progressbar--wrapper .selected-flag').attr('src', `flags/${data.code}.png`);
                      $('.last10Values--title').html(`<img class="selected-flag" src="flags/${data.code}.png"> ${data.code} (${data.currency}) - ${lastValue} PLN (${data.rates[9].effectiveDate})`);
                      if (calculateSum(firstValue, lastValue)) {
                          $('.value-sum').addClass('up')
                          .text((lastValue - firstValue).toString().substring(0, lastValue.toString().length) + ' PLN (' + calculatePercentage(firstValue, lastValue) + '%)');
                      } else {
                          $('.value-sum').removeClass('up')
                          .text((firstValue - lastValue).toString().substring(0, lastValue.toString().length) + ' PLN (' + calculatePercentage(firstValue, lastValue) + '%)');
                      };
                      $('.lastValue--box-title').text(`Średni kurs - ${data.rates[0].effectiveDate} - ${data.rates[9].effectiveDate}`);
                  }, 300);

                  for (let i = 0; i <= arrPlus * 10; i++) {
                      (function(ind) {
                          setTimeout(function() {
                              $('.sublabel-up').text(i + '%');
                              $('.progress-bar-up').text('+ ' + i + '%');
                          }, (arrPlus * 2) * ind);
                      })(i);
                  }

                  for (let i = 0; i <= arrMinus * 10; i++) {
                      (function(ind) {
                          setTimeout(function() {
                              $('.sublabel-down').text(i + '%');
                              $('.progress-bar-down').text('- ' + i + '%');
                          }, (arrMinus * 2) * ind);
                      })(i);
                  }

                  const chart = new Chartist.Line('.ct-chart', {
                      labels: [ data.rates[0].effectiveDate.substring(5, 10),
                                data.rates[1].effectiveDate.substring(5, 10),
                                data.rates[2].effectiveDate.substring(5, 10),
                                data.rates[3].effectiveDate.substring(5, 10),
                                data.rates[4].effectiveDate.substring(5, 10),
                                data.rates[5].effectiveDate.substring(5, 10),
                                data.rates[6].effectiveDate.substring(5, 10),
                                data.rates[7].effectiveDate.substring(5, 10),
                                data.rates[8].effectiveDate.substring(5, 10),
                                data.rates[9].effectiveDate.substring(5, 10)
                              ],
                      series: [
                                {
                                  data: [
                                      { "meta": '#0082CD', "value": dane[0].mid },
                                      { "meta": isPlusOrMinus(dane[1].mid, dane[0].mid), "value": dane[1].mid },
                                      { "meta": isPlusOrMinus(dane[2].mid, dane[1].mid), "value": dane[2].mid },
                                      { "meta": isPlusOrMinus(dane[3].mid, dane[2].mid), "value": dane[3].mid },
                                      { "meta": isPlusOrMinus(dane[4].mid, dane[3].mid), "value": dane[4].mid },
                                      { "meta": isPlusOrMinus(dane[5].mid, dane[4].mid), "value": dane[5].mid },
                                      { "meta": isPlusOrMinus(dane[6].mid, dane[5].mid), "value": dane[6].mid },
                                      { "meta": isPlusOrMinus(dane[7].mid, dane[6].mid), "value": dane[7].mid },
                                      { "meta": isPlusOrMinus(dane[8].mid, dane[7].mid), "value": dane[8].mid },
                                      { "meta": isPlusOrMinus(dane[9].mid, dane[8].mid), "value": dane[9].mid }
                                  ]
                                }
                              ]
                  }, {
                      showArea: true,
                      fullWidth: true,
                      chartPadding: {
                          top: 20,
                          right: 20,
                          left: -20
                      },
                      lineSmooth: Chartist.Interpolation.cardinal({
                          tension: 1
                      }),
                      plugins: [
                          Chartist.plugins.ctPointLabels({
                              textAnchor: 'middle'
                          })
                      ],
                      axisY: {
                          showLabel: false
                      },
                      axisX: {
                          labelOffset: {
                             x: -15,
                             y: 10
                          }
                      }
                  });

                  let seq = 0, delays = 80, durations = 500;

                  chart.on('created', function() {
                      seq = 0;
                  });

                  chart.on('draw', function(data) {
                      if (data.type === 'line' || data.type === 'area') {
                          data.element.animate({
                              d: {
                                  begin: 1500 * data.index,
                                  dur: 1500,
                                  from: data.path.clone().scale(1, 0).translate(0, data.chartRect.height()).stringify(),
                                  to: data.path.clone().stringify(),
                                  easing: Chartist.Svg.Easing.easeOutQuint
                              }
                          });
                      }
                      else if (data.type === 'point' || data.type === 'label') {
                        seq++;
                          data.element.animate({
                              opacity: {
                                  begin: 1000 + seq * delays,
                                  dur: durations,
                                  from: 0,
                                  to: 1,
                                  easing: 'easeOutQuart'
                              }
                          });
                          data.element.attr({
                              style: 'stroke: ' + data.meta + ';'
                          });
                      }
                  });

              }).fail(function(error) {
                  console.log(error);
              });
        };

        generateBtn = () => {
            btnGenerateList.on('click', function() {
                generateList($(this).parent().parent().find('.select-text').attr('data-code'));
            });
        }
        // -> tableList generate end


        // -> history
        getHistory = (value) => {
            $('.history--list').find('.results').remove();
            history.limitToLast(value).on("child_added", function(data) {
                const values = data.val();
                const div = `<div class="results">
                                <div class="col-xs-12 print_date">${values.date}</div>
                                <div class="col-xs-12 col-sm-5">
                                  <div class="resultsTextLeft">${values.valueSet}</div>
                                  <div class="resultsBottomTextLeft">${values.valueSetCode}</div>
                                  <div class="resulstSmallTxt txt-right">${values.valueSetBottom}</div>
                                </div>
                                <div class="col-xs-12 col-sm-2">
                                  <div class="resultsTextCenter">=</div>
                                </div>
                                <div class="col-xs-12 col-sm-5">
                                  <div class="resultsTextRight">${values.valueResult}</div>
                                  <div class="resultsBottomTextRight">${values.valueResultCode}</div>
                                  <div class="resulstSmallTxt txt-left">${values.valueResultBottom}</div>
                                </div>
                              </div>`;
                $('.history--list').prepend(div);
            });
        }

        historyBtn = () => {
            $('.history--show-title .select').on('click', function() {
                ($('.history--numbers-of').attr('data-value') === '10') ? $('.history--numbers-of').attr('data-value', '20').text('20 wyników') : $('.history--numbers-of').attr('data-value', '10').text('10 wyników');
            });
            $('button.show-history').on('click', function() {
                const numbers = parseInt($(this).parent().parent().find('.history--numbers-of').attr('data-value'));
                getHistory(numbers);
                setTimeout(() => {
                    const elements = $('.history--list').children();
                    elements.css('opacity', '.7');
                    for (let i = 0; i < elements.length; i++) {
                        (function(ind) {
                            setTimeout(function() {
                                $(elements[i]).animate({'opacity' : '1'}, 100);
                            }, 30 * ind);
                        })(i);
                    }
                }, 200);
            });
        }
        // -> history end


        init = () => {
            navigation();
            resize();
            getDataRates();
            bodyEvents();
            thTableScrolledDown();
            thTableScrolledUp();
            selectWrapper();
            selectedList();
            convert();
            setTimeout(() => { generateList('usd') }, 400);
            generateBtn();
            historyBtn();
        }

        return {
            init : init()
        }

    })(jQuery);
    app.init;

});
