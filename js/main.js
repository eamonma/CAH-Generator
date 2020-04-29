var _gaq = [
    ['_setAccount', 'UA-XXXXX-X'],
    ['_trackPageview']
];
(function (d, t) {
    var g = d.createElement(t),
        s = d.getElementsByTagName(t)[0];
    g.src = '//www.google-analytics.com/ga.js';
    s.parentNode.insertBefore(g, s)
}(document, 'script'));

$(document).ready(function () {
    $('input:radio[name=card-color]').change(function (e) {
        if ($(this).val() === 'black') {
            $('input:radio[name=mechanic]').prop('disabled', false);
        } else {
            $('input:radio[name=mechanic]').prop('disabled', true);
        }
    });

    $('#icon').change(function (e) {
        if ($(this).val() === 'custom') {
            $('#customIconLabel').css('visibility', 'visible');
        } else {
            $('#customIconLabel').css('visibility', 'hidden');
        }
    });

    $('#generator').submit(function (e) {
        var form = $(this),
            button = $('#generate-button'),
            batch = 'submit_' + (Date.now() * Math.random() * 100000).toString(36),
            dl_button = $('#zipDownload'),
            text = $('#card-text'),
            batch_count;

        $(".alert").alert('close')

        dl_button.unbind('click');
        dl_button.prop('disabled', true);

        $('#batch-id').attr('value', batch);
        text.val(_.without(text.val().split('\n'), "").join('\n').replace(
            /([^_])_([^_])|([^_])_([^_]?)$|^([^_]?)_([^_])/g,
            '\$1\$3\$5___________________\$2\$4\$6').replace(/"(.+?)"/g,
            "\\x{201C}\$1\\x{201D}").replace(/'/g, "\\x{2019}"));
        batch_count = text.val().split('\n').length;

        // Cards entered are valid
        if (batch_count < 31 && text.val() !== "") {
            button.button('loading');
            $.ajax({
                type: 'POST',
                url: 'generator.php',
                data: new FormData(document.forms.generator),
                cache: false,
                contentType: false,
                processData: false
            }).done(function () {
                dl_button.click(function () {
                    window.location = 'files/' + batch + '/' + batch + '.zip';
                });

                dl_button.prop('disabled', false);
                button.button('reset')

            }).fail(function () {
                alert('An Error Occurred, you should refresh the page.')
            })

            $('#batchModal').modal('show');
            view_batch(batch, batch_count);
        } else {
            // No cards were entered
            if (text.val() == "") {
                $('<div class="alert alert-danger alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button><strong>Oh Snap!</strong> You didn\'t enter in any cards to generate, stupid.</div>')
                    .prependTo(form);
            }
            // Too many cards were entered
            if (batch_count >= 31) {
                $('<div class="alert alert-danger alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button><strong>Oh Snap!</strong> The generator can\'t make more than 30 cards at once. Learn to read.</div>')
                    .prependTo(form);
            }
        }

        text.val(_.without(text.val().split('\n'), "").join('\n').replace(/\\x{201C}|\\x{201D}/g, '"')
            .replace(/\\x{2019\}/g, "'"));

        e.preventDefault();
    });

    $('#generate-button').click(function (e) {
        $('#generator').submit();
    });
});

var view_batch = function (batch, batch_count) {
    var modalBody = $('#batchModal .modal-body').empty(),
        row = $('<div>').attr("class", "row").appendTo(modalBody),
        i = 0,
        spinner = new Image(),
        col,
        max_attempts = 10,
        loadImages = function (attempt) {
            var img = new Image(),
                imgURL = 'files/' + batch + '/' + batch + '_' + i + '.png';

            if ($(col).html() != $(spinner).get(0).outerHTML) {
                col = $('<div>').attr({
                    "class": "col-md-4",
                    style: "text-align: center;"
                }).appendTo(row);

                $(col).html($(spinner));
            }

            $(img).load(function () {
                $(col).html($(this));
                i++;
                if (i < batch_count) {
                    loadImages(0);
                }
            }).attr({
                src: imgURL,
                width: '100%',
                style: 'border: 1px solid #888; border-radius: 15px; box-shadow: 1px 1px 1px 1px #999'
            }).error(function () {
                attempt++;
                if (attempt < max_attempts) {
                    setTimeout(function () {
                        loadImages(attempt)
                    }, 5000);
                }
            });
        }

    $(spinner).attr({
        src: "img/preloader_transparent.gif"
    });

    loadImages(0);

}