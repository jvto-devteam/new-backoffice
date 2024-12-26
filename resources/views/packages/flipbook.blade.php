<!doctype html>
<html lang="en">
<head>
<meta name="viewport" content="width = 1050, user-scalable = no" />
<meta property="og:title" content="Java Volcano Tour Operator">
<meta property="og:description" content="LEGALITY PT JAVA VOLCANO RENDEZVOUS">
<meta property="og:url" content="{{url('flip/jvr/legality')}}">
<meta property="og:image" content="{{'https://javavolcano-touroperator.com/assets/flip/legality/1.jpg'}}">
<link rel="canonical" href="{{request()->url()}}" />
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" integrity="sha512-SnH5WK+bZxgPHs44uWIX+LLJAJ9/2PkPKZ5QiAj6Ta86w+fsb2TkcmfRyVX3pBnMFcV7oQPJkl9QevSCWr3W6A==" crossorigin="anonymous" referrerpolicy="no-referrer" />
<script type="text/javascript" src="{{'https://javavolcano-touroperator.com/assets/turnjs/extras/jquery.min.1.7.js'}}"></script>
<script type="text/javascript" src="{{'https://javavolcano-touroperator.com/assets/turnjs/extras/modernizr.2.5.3.min.js'}}"></script>
<title>LEGALITY PT JAVA VOLCANO RENDEZVOUS</title>
</head>
<body>
<style>
	.flipbook-viewport .container{
		position: inherit;
		top : 0;
		left : 0;
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100vh;
	}
	.flipbook-viewport .flipbook{
		left: 0;
		top : 0;
	}
	.button{
		width: 100px;
		font-size : 50px;
		height: 300px;
		border : 0;
		background: rgba(0, 0, 0, 0.2);
		position: absolute;
		top : 50%;
		z-index: 100;
		transform: translateY(-50%);
		-webkit-transform: translateY(-50%);
		-o-transform: translateY(-50%);
		-moz-transform: translateY(-50%);
		display: none;
		color:white;
		cursor: pointer;
	}
	.button[data-type='prev']{
		border-radius: 0px 25px 25px 0px;
		left : 0
	}
	.button[data-type='next']{
		border-radius: 25px 0px 0px 25px;
		right : 0
	}
	.logo-top{
		position: absolute;
		top : 10px;
		left : 50%;
		transform: translateX(-50%);
	}
	.logo-top img{
		width : 100px;
	}
</style>
<a href="{{ url('/') }}" class="logo-top" aria-label="Java Volcano Tour Operator">
	<img src="{{ 'https://javavolcano-touroperator.com/assets/img/jvto-color.png' }}" alt="Logo JVTO" srcset="">
</a>
<div class="flipbook-viewport">
	<div class="container">
		<div class="flipbook">
            <div>aaaa</div>
            <div>bbbb</div>
            <div>ccc</div>
            <div>ddd</div>
            <div>eee</div>
		</div>
	</div>
</div>
<button class="button" data-type="prev"><span class="fa fa-chevron-left"></span></button>
<button class="button" data-type="next"><span class="fa fa-chevron-right"></span></button>
<audio id="pageChangeAudio" src="{{'https://javavolcano-touroperator.com/assets/woosh.wav'}}"></audio>


<script type="text/javascript">
    function playPageChangeAudio() {
        var audio = document.getElementById('pageChangeAudio');
        audio.play();

        setTimeout(function () {
            audio.pause();
            audio.currentTime = 0; // Reset audio to start
        }, 1000); // Adjust time (in milliseconds) as needed        
    }

	function loadApp() {
		var displayMode = ""
		var heightPage = ""
		var widthPage = ""
		if(screen.width > 576){
			displayMode = "double"
			widthPage = "60%"
			heightPage = "85vh"
			$(".button").css({'display':'block'})
		}
		else{
			displayMode = "{{request()->double ? 'double' : 'single' }}"
			widthPage = "90%"
			heightPage = "65vh"
//			$("body").css({'background':'black'})
			$(".flipbook-viewport .container").css({'padding':'20px 0px'})
			$(".button").css({'display':'block'})
		}
		$('.flipbook').turn({
            duration : 2500,
			width:widthPage,
			height:heightPage,
			gradients: true,
			autoCenter: true,
			display: displayMode
		});
        $('.flipbook').bind('turning', function (event, page, view) {
            playPageChangeAudio(); // Play audio when turning the page
        });
		updateButtonStatus()
	}


	$('.button').on('click', function() {
        var type = $(this).data('type');
        if (type === 'prev') {
            $('.flipbook').turn('previous');
        } else if (type === 'next') {
            $('.flipbook').turn('next');
        }
		updateButtonStatus()
    });	

    function updateButtonStatus() {
        var currentPage = $('.flipbook').turn('page');
        var totalPages = $('.flipbook').turn('pages');
        if (currentPage === 1) {
            $('[data-type="prev"]').prop('disabled', true);
        } else {
            $('[data-type="prev"]').prop('disabled', false);
        }

        if (currentPage === totalPages) {
            $('[data-type="next"]').prop('disabled', true);
        } else {
            $('[data-type="next"]').prop('disabled', false);
        }		
	}
	
	yepnope({
		test : Modernizr.csstransforms,
		yep: ["{{'https://javavolcano-touroperator.com/assets/turnjs/lib/turn.js'}}"],
		nope: ["{{'https://javavolcano-touroperator.com/assets/turnjs/lib/turn.html4.min.js'}}"],
		both: ["{{'https://javavolcano-touroperator.com/assets/turnjs/css/basic.css'}}"],
		complete: loadApp
	});

</script>

</body>
</html>