$(function() {

  // Default selected data
  let selectFromDataMid = 1;
  let selectFromDataCode = 'PLN';
  let selectToDataMid = 1;
  let selectToDataCode = 'PLN';

  // Get data from NBP api
  const dataUrl = 'http://api.nbp.pl/api/exchangerates/tables/a/?format=json';

  // New PLN obj
  const pln = {
    currency: 'złoty',
    code: 'PLN',
    mid: 1
  };

  // Ajax get dataUrl
  function getData() {
    $.ajax({
      url: dataUrl,
      dataType: 'json',
      method: 'GET'
    }).done(function(data) {

        $('.small-top-text-date').text(`${data[0].effectiveDate}`);

        const addPln = [pln, ...data[0].rates];
        let newArray = [];

          // push only 14 items to newArray
          for (let i = 0; i < 14; i++) {
            newArray.push(addPln[i]);
          };

        $('.select-from-text').attr('data-mid', newArray[0].mid);
        $('.select-from-text').attr('data-code', selectFromDataCode);
        $('.select-to-text').attr('data-mid', newArray[0].mid);
        $('.select-to-text').attr('data-code', selectToDataCode);
        $('.select-from-text').text(`${newArray[0].code} (${newArray[0].currency})`);
        $('.select-to-text').text(`${newArray[0].code} (${newArray[0].currency})`);

        for (let i = 0; i < newArray.length; i++) {
          const selectDataLi = `<li data-mid=${newArray[i].mid} data-code=${newArray[i].code} data-currency=${newArray[i].currency}><img class="flags" src="./flags/${newArray[i].code}.png">${newArray[i].code} (${newArray[i].currency})</li>`;
          $(selectDataLi).hide().appendTo('.select-values').fadeIn('slow');
        };

        for (let i = 1; i < 10; i++) {
          const currencyTop = `<div class="th-table-in">
                                  <div class="th-table-in-top"><img class="flags" src="./flags/${newArray[i].code}.png">${newArray[i].code}</div>
                                  <div class="th-table-in-bottom">${newArray[i].mid} PLN</div>
                                </div>`;
          $(currencyTop).hide().appendTo('.th-table-scrolled').fadeIn('slow');
        };

    }).fail(function(error) {
      console.log(error);
    });
  };
  getData();

  // th-table-scrolled down button
  let scrolled = 0;
  $('.th-table-button-down').click(function() {
    if (scrolled === 414) {
      scrolled = 414;
    } else {
      scrolled = scrolled + 69;
      $('.th-table').stop().animate({
        scrollTop: scrolled
      });
    };
  });

  // th-table-scrolled up button
  $('.th-table-button-up').click(function() {
    if (scrolled === 0) {
      scrolled = 0;
    } else {
      scrolled = scrolled - 69;
      $('.th-table').stop().animate({
        scrollTop: scrolled
      });
    };
  });

  // Body click
  // Add and remove active class on select-values
  // Add border-color on form-control:focus
  // Toggle arrow up / arrow down on form-control
  $('body').click(function(event) {

    // Take width from form-control and added it to select-values
    let width = $('.form-control').width();
    $('.select-values').css('width', width + 25);

    if ($(event.target).closest('.inputValue').length) {

      if (!$('.input').hasClass('alert-border')) {
        $('.input').addClass('focus');
      };

    }

    else if ($(event.target).closest('.select-from').length) {

      $('.input').removeClass('focus');

      $('.select-from').toggleClass('focus');
        if ($('.select-from').hasClass('focus')) {
          $('.select-from').children('.form-control-arrow-down').removeClass('form-control-arrow-down').addClass('form-control-arrow-up');
        } else {
          $('.select-from').children('.form-control-arrow-up').removeClass('form-control-arrow-up').addClass('form-control-arrow-down');
        };

      $('.select-to').removeClass('focus');
      $('.select-to').children('.form-control-arrow-up').removeClass('form-control-arrow-up').addClass('form-control-arrow-down');
      $('.select-values-from').toggleClass('active');
      $('.select-values-to').removeClass('active');

    } else if ($(event.target).closest('.select-to').length) {

      $('.input').removeClass('focus');

      $('.select-to').toggleClass('focus');
        if ($('.select-to').hasClass('focus')) {
          $('.select-to').children('.form-control-arrow-down').removeClass('form-control-arrow-down').addClass('form-control-arrow-up');
        } else {
          $('.select-to').children('.form-control-arrow-up').removeClass('form-control-arrow-up').addClass('form-control-arrow-down');
        };

      $('.select-from').removeClass('focus');
      $('.select-from').children('.form-control-arrow-up').removeClass('form-control-arrow-up').addClass('form-control-arrow-down');
      $('.select-values-to').toggleClass('active');
      $('.select-values-from').removeClass('active');

    } else {

      $('.input').removeClass('focus');
      $('.select-from').removeClass('focus');
      $('.select-to').removeClass('focus');
      $('.form-control-arrow-up').removeClass('form-control-arrow-up').addClass('form-control-arrow-down');
      $('.select-values-to').removeClass('active');
      $('.select-values-from').removeClass('active');

    };

  });

  // select-from click
  $('.select-from').click(function() {
    $('.select-values-from li').each(function() {
      $(this).click(function() {
        let txt = $(this).text();
        $('.select-from-text').text(txt);
        selectFromDataMid = $(this).data('mid');
        selectFromDataCode = $(this).data('code');
        $('.select-from-text').attr('data-mid', selectFromDataMid);
        $('.select-from-text').attr('data-code', selectFromDataCode);
        $('.selected-flag-from').attr('src', `./flags/${selectFromDataCode}.png`);
      });
    });
  });

  // select-to click
  $('.select-to').click(function() {
    $('.select-values-to li').each(function() {
      $(this).click(function() {
        let txt = $(this).text();
        $('.select-to-text').text(txt);
        selectToDataMid = $(this).data('mid');
        selectToDataCode = $(this).data('code');
        $('.select-to-text').attr('data-mid', selectToDataMid);
        $('.select-to-text').attr('data-code', selectToDataCode);
        $('.selected-flag-to').attr('src', `./flags/${selectToDataCode}.png`);
      });
    });
  });

  // convert btn click
  $('.convert').click(function() {

    const regex = /^[0-9]*\.?[0-9]*$/;
    const inputValue = $('.inputValue').val();
    const inputValueMod = inputValue * 100 + 0.001;
    const inputValueModToFixed = inputValueMod.toFixed(0);
    const inputValueModLength = inputValueModToFixed.toString().length;
    const inputResult = inputValueMod.toString().substring(0, inputValueModLength-2) + "." + inputValueMod.toString().substring(inputValueModLength-2, inputValueModLength);
    const results = ((selectFromDataMid / selectToDataMid) * inputValue).toFixed(2);
    const bottomFromTxt = $('.select-from-text').text();
    const bottomToTxt = $('.select-to-text').text();

    if (inputValue.length === 0) {

        $('.input-alert').css('display', 'inline-block');
        $('.input-alert').text('Podaj kwotę');
        $('.input-alert').css('marginLeft', -60);
        $('.input').addClass('alert-border');

    } else if (!regex.test(inputValue)) {

        $('.input-alert').css('display', 'inline-block');
        $('.input-alert').text('Nieprawidłowa wartość');
        $('.input-alert').css('marginLeft', -95.5);
        $('.input').addClass('alert-border');

    } else {

        $('.input-alert').css('display', 'none');
        $('.input').removeClass('alert-border');

        const resultsDiv = `<div class="results">
                              <div class="col-xs-12 col-sm-5">
                                <div class="resultsTextLeft">${inputResult} ${selectFromDataCode}</div>
                                <div class="resultsBottomTextLeft">${bottomFromTxt.substring(5, bottomFromTxt.length-1)}</div>
                              </div>
                              <div class="col-xs-12 col-sm-2">
                                <div class="resultsTextCenter">=</div>
                              </div>
                              <div class="col-xs-12 col-sm-5">
                                <div class="resultsTextRight">${results} ${selectToDataCode}</div>
                                <div class="resultsBottomTextRight">${bottomToTxt.substring(5, bottomToTxt.length-1)}</div>
                              </div>
                            </div>`;

        $('.resultsZero').remove();
        $(resultsDiv).prependTo('.results-top');
        $('.results:nth-of-type(2)').addClass('oldResults');
        $('.results:nth-of-type(2)').prependTo('.results-bottom');
        $('.results:nth-of-type(1n+2)').remove();

        if ($('.results-bottom').children().length > 0) {
          $('.label-previous').css('display', 'block');
        };

    };

  });

});
