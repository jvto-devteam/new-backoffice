<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <meta property="og:title" content="{{request()->get('title')}}" />
    <meta property="og:description" content="Preview File" />
    <meta property="og:image" content="https://legacy.javavolcano-touroperator.com/assets/img/download.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="627" />
    <link rel="icon" type="image/png" href="https://legacy.javavolcano-touroperator.com/assets/img/download.png" id="favicon"/>

    <title>{{request()->get('title')}}</title>
</head>
<body>
    <style>
        *{
            margin: 0px;
            padding : 0px;
        }
        #pdf-viewer{
            width : 100vw;
            height : 100vh;
            overflow: hidden;
        }
    </style>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfobject/2.2.7/pdfobject.min.js"></script>
    <div id="pdf-viewer"></div>
    <script>
        PDFObject.embed("{{request()->get('url')}}", "#pdf-viewer");
    </script>    
</body>
</html>