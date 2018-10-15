$('.dropdown').on('show.bs.dropdown', function(e) {
    $(this).find('.dropdown-menu').first().stop(true, true).slideDown(300);
});

$('.dropdown').on('hide.bs.dropdown', function(e) {
    $(this).find('.dropdown-menu').first().stop(true, true).slideUp(200);
});

const canvas = document.getElementById('canvas')
const c = canvas.getContext('2d')

const mainDiv = $('#main');
canvas.width = window.innerWidth;
if (mainDiv.height() > window.innerHeight) {
    canvas.height = mainDiv.height();
} else {
    canvas.height = window.innerHeight;
}

const maxRadius = 30

window.addEventListener('resize', function() {
    canvas.width = window.innerWidth
    if (mainDiv.height() > window.innerHeight) {
        canvas.height = mainDiv.height();
    } else {
        canvas.height = window.innerHeight;
    }
})

const prop = {
    colors: ['#2C3E50', '#E74C3C', '#ECF0F1', '#3498DB', '#2980B9'],
    count: 20
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function Circle(x, y, r) {
    const randomNumber = Math.floor(Math.random() * 4)
    const randomTrueOrFalse = Math.floor(Math.random() * 2)

    this.x = x
    this.y = y
    this.r = r
    this.color = prop.colors[randomNumber]

    this.draw = function() {
        c.beginPath()
        c.arc(
            this.x,
            this.y,
            Math.abs(this.r),
            0,
            Math.PI * 2
        )
        c.fillStyle = this.color
        c.fill()
    }
}

let circleArray = []

function init() {
    for (let i = 0; i < prop.count; i++) {
        const randomX = Math.random() * canvas.width
        const randomY = Math.random() * canvas.height
        const randomR = Math.random() * maxRadius
        circleArray.push(
            new Circle(randomX, randomY, randomR)
        )
    }
    c.clearRect(0, 0, canvas.width, canvas.height)
    for (let i = 0; i < circleArray.length; i++) {
        circleArray[i].draw()
    }
}

init()

var add = $('#regsiter')
var currentEntry = $('.form-subjects .input-group:last')

function addNew() {
    var formSubjects = $('.form-subjects')
    var newEntry = $(currentEntry.clone())
    formSubjects.append(newEntry)
    newEntry.find('input').val('')
}

function removeOne() {
    $('.form-subjects .input-group:last').remove()
}

$('input[type=radio][name=user]').change(function() {
    if (this.value === 'student') {
        $('#csc-check').prop('disabled', false)
        $('#cse-check').prop('disabled', false)
        $('#year').prop('disabled', false)
    } else if (this.value === 'faculty') {
        $('#csc-check').prop('disabled', true)
        $('#cse-check').prop('disabled', true)
        $('#year').prop('disabled', true)
    }
});