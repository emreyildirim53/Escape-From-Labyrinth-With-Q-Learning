var imgFill;
var row=0;// sahnenin boyutu
var iteration=10; //oyunun kaç kere tekrarlanacağı
var matrisQ; // Hazır dışarıdan okunan qmatrisi için initial matris.
var nameExam; // Örnek haritanın boyutu 
var alpha=0.5; // öğrenme katsayısı, default değeri 0.5
var fragSolition=false; // çözümü doğrudan mı çalıştıracak yoksa sıfırdan çözecekmi bayrak kontrolü
var speed=50; // playerın hareket hızı
//Dinamik sahne oluşturma fonksiyonu
function tableCreate(row,column) {
    document.getElementById('grid').innerHTML="";
    var grid = document.getElementById('grid');
    var table = document.createElement('table');
    table.className="myTable";
    var tableBody = document.createElement('tbody');
    for (var i = 0; i < row; i++) {
        var tr = document.createElement('tr');
        for (var j = 0; j < column; j++) {
                var td = document.createElement('td');
                (i==0 && j==0)?td.className="imgagent":td.className="imgmiddle";
                var up=document.createElement('div');
                var right=document.createElement('div');
                var down=document.createElement('div');
                var left=document.createElement('div'); 

                var p=document.createElement('p');
                var txt = document.createTextNode('0'); 
                p.appendChild(txt);
                up.appendChild(p);

                p=document.createElement('p');
                txt = document.createTextNode('0'); 
                p.appendChild(txt);
                right.appendChild(p);

                p=document.createElement('p');
                txt = document.createTextNode('0'); 
                p.appendChild(txt);
                down.appendChild(p);

                p=document.createElement('p');
                txt = document.createTextNode('0'); 
                p.appendChild(txt);
                left.appendChild(p);

                if(i!=0){up.className="rowUp";td.appendChild(up);}
                if(j!=column-1){right.className="rowRight";td.appendChild(right);}
                if(i!=row-1){down.className="rowDown";td.appendChild(down);}
                if(j!=0){left.className="rowLeft";td.appendChild(left);} 
                tr.appendChild(td);          
        }
        tableBody.appendChild(tr);
    }
    table.appendChild(tableBody);
    grid.appendChild(table);
}

jQuery(".submit").click(function(){
    tableCreate(document.getElementById("txtRow").value,document.getElementById("txtRow").value);
});

// Sahneye oyun elemanı eklemek için fonksiyon
$(document).on('click','td',function(){
    if(imgFill){
        $(this).removeClass('imgmiddle');
        $(this).removeClass('imgblock');
        $(this).removeClass('imgbox');
        $(this).removeClass('imggoal');
        $(this).removeClass('imgagent');
        $(this).addClass("img"+imgFill.context.currentSrc.split('/')[imgFill.context.currentSrc.split('/').length-1].slice(0,-4));
    }else{
    	$("#floorsFrame").addClass("vibration");
    	$("#infoItem").html("Bir nesne seçiniz.");
    	setTimeout(function(){
    		$("#floorsFrame").removeClass("vibration");
    		$("#infoItem").html("");
    	},800);
        //alert("Bir nesne seçiniz.");
    }
    //console.log(parseInt( $(this).parent().index())+","+parseInt( $(this).index()));
});

//Sahneye yerleştirilecek itemin seçimi
$(function () {
  $("img").click(function() {
     $('img').removeClass('frame'); //Clear all checked class on .img
     $(this).addClass('frame'); //Add checked class to current clicked .img
     imgFill=$(this);
  });
});

// Girdi değerlerinin dinlenmesi
$('#txtRow').on('change', function() {
  row=this.value;
  tableCreate(row,row);
  nameExam=row+"x"+row;
});
$('#txtAlpha').on('change', function() {
  alpha=this.value;
});

$('#txtIteration').on('change', function() {
 iteration=this.value;
});

$('input[type=range]').on('input', function () {
    $(this).trigger('change');
    $('#speed').text($(this).val());
    speed=$(this).val();
});

//Dinamik oluşturulan harita için R matrisinin yaratılması
function calculateR(row){
    var R=new Array();
    $('.myTable tr').each(function() { //tüm satırları gez
      var rowR=new Array();
      $(this).find('td').each (function() { // tüm sütunları gez
        var className=$(this).attr('class')
        if(className=="imgbox" || className=="imgblock")
            rowR.push(-1);
        else if(className=="imggoal")
            rowR.push(100);
        else
            rowR.push(0);
      });
      R.push(rowR);
    });
    return R;
}

//Alınan R matrisine göre haritanın oluşturulması.
function createMap(matrisR){
    row=matrisR[0].length;
    tableCreate(row,row);
    $('.myTable tr').each(function() { //tüm satırları gez
      $(this).find('td').each (function() { // tüm sütunları gez
            var row=parseInt($(this).parent().index());
            var col=parseInt($(this).index());
            $(this).removeClass('imgmiddle');
            $(this).removeClass('imgblock');
            $(this).removeClass('imgbox');
            $(this).removeClass('imggoal');
            $(this).removeClass('imgagent');
            if(matrisR[row][col]==-1)$(this).addClass("imgblock");
            /*if(matrisR[row][col]==-1)
                if(Math.floor(Math.random() * 5)%2==0)
                    $(this).addClass("imgblock");
                else
                    $(this).addClass("imgbox");*/
            if (matrisR[row][col]==100)
                $(this).addClass("imggoal");
            if (matrisR[row][col]==0 && !(row==0 && col==0))
                $(this).addClass("imgmiddle");
            if(row==0 && col==0)
                $(this).addClass("imgagent");
      });
    });
}   

// Örnek haritaların içeri aktarılması.
function exams(filename){
    var matrisR = new Array();
    $.get('R_matris\\'+filename+'.txt', function(data){
            var line=data.split('\n');
            for(var i=0;i<line.length;i++){
                var element=line[i].split(' ').map(Number);
                matrisR.push(element);
            }
            createMap(matrisR);
    });
    nameExam=filename.substring(4,filename.length);
    $('.loadResult').css('display', 'inline-block');
}

// Çalıştırılıp çözüme ulaşan problemlerin son q matrislerinin indirilebilir hale getirilmesi.
function download() {
    if(nameExam){
        var element = document.createElement('a');
        var text='';
        for(var i=0;i<matrisQ.length;i++){
            for(var j=0;j<matrisQ[i].length;j++)
                text+=matrisQ[i][j]+' ';
            text+="\n";
        }
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', 'q('+nameExam+')');

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }
}

// İçeriye aktarılan çözümün okunup çalıştırılması.
function solution(){
    if(nameExam){
        matrisQ=new Array();
        $.get('Q_matris\\q('+nameExam+').txt', function(data){
            var line=data.split('\n');
            for(var i=0;i<line.length;i++){
                var seri=line[i].split(' ');
                var row=new Array();
                for(var j=0;j<seri.length;j++)
                    row.push(seri[j].split(',').map(Number));
                matrisQ.push(row);
            }
            fragSolition=true;
            $(".btnStart").click();//çözümü çalıştır.
        });
       
    }
}

//Algoritma adımlarının başladığı yer
$(".btnStart").click(function(){
    console.log("frag durumu:"+fragSolition);
    console.log(nameExam);
   	if(row==0){ 

   		//alert("Bir harita oluşturunuz veya hazır haritalardan seçiniz.");

   		$(".processInput").addClass("vibration");
   		$("#maps").addClass("vibration");
    	$("#infoMap").html("Bir harita yaratınız veya seçiniz.");
    	setTimeout(function(){
    		$(".processInput").removeClass("vibration");
   			$("#maps").removeClass("vibration");
    		$("#infoMap").html("");
    	},800);

   	}else{
	    if(fragSolition){
	        console.log("Durum: çözümü getir.");
	        new ReinforcementLearning(matrisQ,row,alpha,iteration,calculateR(row),new Array(0,0));
	    }else{
	        console.log("Durum: hesapla");
	        var q = new Array(row);
	        for(var i = 0; i <row; i++) 
	            q[i] = new Array(row);
	        new ReinforcementLearning(q,row,alpha,iteration,calculateR(row),new Array(0,0));
	    }
	    $(".btnStart").html()=="Başlat"?$(".btnStart").html("Durdur"):$(".btnStart").html("Başlat");
    }
	
});

// Q learning algoritmasının oluşturulduğu sınıftır.

class ReinforcementLearning{
    //Tanımlamalar yapıldı.,
    //Öğrenme değerleri burada atanacak.
    constructor(q,Q_SIZE,GAMMA,ITERATIONS,R,initialState) {
        this.Q_SIZE = Q_SIZE;
        this.GAMMA = GAMMA;
        this.ITERATIONS=ITERATIONS;
        this.R=R;
        this.q =q
        this.initialState=initialState;
        this.direction=0;
        this.tempAction;
        this.action;
        this.say=0;
        this.tempinitialState=initialState;
        this.cevap=true;
        this.start();
    }
    //q matrisinin ilk değerleri atandı.
    initialize(){
        for(var i = 0; i < this.Q_SIZE; i++)
            for(var j = 0; j < this.Q_SIZE; j++)
                if(this.R[i][j]==-1)
                    this.q[i][j]= new Array(-1,-1,-1,-1);
                else
                    this.q[i][j] = new Array(0,0,0,0);
        return;
    }
    
    train(){
        var deferred=$.Deferred();

        if(!fragSolition){ // frag hesaplama yapılsın mı yoksa çözümü direk işlesin mi? işlemi
            this.initialize(); // ilk değer ataması
            this.say=0;
            var that=this;
            infiniteLoop();
            
            function infiniteLoop(){
	            setTimeout(function(){
                    // aksiyon seçimi sonrası karakter hareketi ve yeni aksiyon seçimi
	            	that.action=that.chooseAnAction(that.initialState[0],that.initialState[1]);
	                that.moveHero(that.initialState,that.action).then(function(){               
                        that.updateDirectory($.extend(true, [], that.q)); 
	                    if(that.reward()==1){ deferred.resolve();that.cevap=false;}      
	                });
                    
	            	if(!that.cevap)
	            		return;
	            	else
	            		infiniteLoop();
	            },1000-speed*10);
        	}
         }else{
            console.log("Sonuç Yüklendi. frag=false");
            this.moveSmartHero(this.q);
            this.updateDirectory($.extend(true, [], this.q));
            fragSolition=false;
        }
        //this.updateDirectory($.extend(true, [], this.q));// q matrisi ile referansı koparıldı. //yönler güncellendi.

        return deferred.promise();
    }

    //q matrisinin hesaplanması ve aksiyonların güncellenmesi
    reward(){
        this.q[this.initialState[0]][this.initialState[1]][this.direction]=this.GAMMA*(this.R[this.action[0]][this.action[1]]+this.maxActionState(this.action[0],this.action[1]));
        if(this.R[this.action[0]][this.action[1]]==100){
            this.say++;
            console.log(this.say+". ITERATION");
            $("#infoMap").html(this.say+".iterasyon tamamlandı.");
            this.showResult();
            if(this.say>=this.ITERATIONS){this.say=0;return 1};
            this.initialState=new Array(0,0);
        }else
        this.initialState=this.action;
    }

    // karaktere hareket özelliğini veren fonksiyon
    moveHero(currentState,action) {
        var deferred=$.Deferred();
        console.log(currentState+" den "+action+" haraket edildi.");
        var that=this;
        var className = $('.myTable tr:eq('+currentState[0]+') td:eq('+currentState[1]+')').attr('class');
        
        var interval=setTimeout(function changeClass() { 

            $('.myTable tr:eq('+currentState[0]+') td:eq('+currentState[1]+')').attr("class","imgmiddle");
            if(that.R[action[0]][action[1]]==100){
                $('.myTable tr:eq('+action[0]+') td:eq('+action[1]+')').attr("class","imggoal");
            }
            else
                $('.myTable tr:eq('+action[0]+') td:eq('+action[1]+')').attr("class","imgagent");
            clearTimeout(interval);
        }, 1000);
        
        deferred.resolve();
       
        return deferred.promise();   
    }

    //Çözümü bilen karakterin hareketini sağlayan fonksiyon //geliştirilmeli.
    moveSmartHero(matrisQ) {
        /*
            Önceden sonuçlanmış q matrisi gelecek.
            Her q[i][j] için 4 (up,right,down,left) değer vardır.
            Bahsi geçen değerlerin en büyüğünü alıp action yönü o olacaktır.
        */    
        var that=this;
        $('.myTable tr').each(function() { //tüm satırları gez
            $(this).find('td').each (function() { // tüm sütunları gez
                var row=parseInt($(this).parent().index()); // Satır indisi.
                var col=parseInt($(this).index()); //  Sütun indisi.
                if(row==0 &&  col==0)
                    $(this).attr("class","imgmiddle");    
                if(that.R[row][col]==100){
                $('.myTable tr:eq('+row+') td:eq('+col+')').attr("class","imggoal");
                }else if(row==that.Q_SIZE-1 && col==that.Q_SIZE-1)
                    $(this).attr('class',"imgagent");
          });
        });          
    }

    // Playerın bulunduğu konuma göre yapabileceği hareketler arasında seçim yapan fonksiyon
    chooseAnAction(row,col){
        //Harita üzerinde özel konumlar için initial değer ataması.
        if(row==0)
            this.q[row][col][0]=-1;
        else if(this.R[row-1][col]==-1)
            this.q[row][col][0]=-1;

        if(col==0)
            this.q[row][col][3]=-1;
        else if(this.R[row][col-1]==-1)
            this.q[row][col][3]=-1;

        if(row==this.Q_SIZE-1)
            this.q[row][col][2]=-1;
        else if(this.R[row+1][col]==-1)
            this.q[row][col][2]=-1; 
       
        if(col==this.Q_SIZE-1)
            this.q[row][col][1]=-1;
        else if(this.R[row][col+1]==-1)
            this.q[row][col][1]=-1;

        // Durum matrisinde her bir durum için tanımlanmış actionların içeri aktarılması
        var up,left,down,right;

        up=this.q[row][col][0];
        left=this.q[row][col][1];
        down=this.q[row][col][2];
        right=this.q[row][col][3];


        var directorCordi=new Array(); //Mevcut durumdan gidilecek yönü (actionun gösterdiği yol) tutan değişken
        var director=new Array();

        var directorValue=new Array(up,down,left,right);

        var max = Math.max.apply(null, directorValue); // get the max of the array
        directorValue.splice(directorValue.indexOf(max), 1); // remove max from the array
        var max2= Math.max.apply(null, directorValue);
        directorValue.splice(directorValue.indexOf(max), 1); // remove max from the array
        var max3= Math.max.apply(null, directorValue);

        if(up>=0){
            directorCordi.push(new Array(row-1,col));
            director.push(0);
        }
        if(left>=0){
            directorCordi.push(new Array(row,col+1));
            director.push(1);
        }
        if(down>=0){
            directorCordi.push(new Array(row+1,col));
            director.push(2);
        }
        if(right>=0){
            directorCordi.push(new Array(row,col-1));
            director.push(3);
        }

        var rnd=Math.floor(Math.random() * directorCordi.length);

        this.direction=director[rnd];

        return directorCordi[rnd];
    }

    // her hücre için q matris değerleri ve renklendirmelerin yapılmasını sağlayan fonksiyon
    updateDirectory(qMatris){
        console.log("oklar update edildi.");
        qMatris=this.normalizeQmatris(qMatris);// renk kodu için 0-255 arasına renk taşındı.
        //qMatris: 0=> up, 1=> right, 2=> down, 3=> left;
        var that=this;
        $('.myTable tr').each(function() { //tüm satırları gez
            $(this).find('td').each (function() { // tüm sütunları gez
                var row=parseInt($(this).parent().index());
                var col=parseInt($(this).index());

                if(that.R[row][col]==-1)
                    $(this).find('div').each (function() {$(this).remove(); });
                if(row+1<that.Q_SIZE)
                    if(that.R[row+1][col]==-1)
                        $(this).find('div').each (function() { if($(this).context.className=="rowDown")$(this).remove(); });  
                if(row-1>-1)
                    if(that.R[row-1][col]==-1)
                        $(this).find('div').each (function() { if($(this).context.className=="rowUp")$(this).remove(); });  
                if(col+1<that.Q_SIZE)
                    if(that.R[row][col+1]==-1)
                        $(this).find('div').each (function() { if($(this).context.className=="rowRight")$(this).remove(); });  
                if(col-1>-1)
                    if(that.R[row][col-1]==-1)
                        $(this).find('div').each (function() { if($(this).context.className=="rowLeft")$(this).remove(); });  
                
                $(this).find('div').each (function() { 
                    var boost=50;
                    if($(this).context.className=="rowUp"){
                        $(this).find('p').each (function() {$(this).context.innerText=(that.q[row][col][0]).toFixed(4);});
                        var booster=Math.floor((qMatris[row][col][0]));
                        if(Math.floor((qMatris[row][col][0]))+boost<225)
                            booster=Math.floor((qMatris[row][col][0]))+boost;
                        $(this).css("background-color", 'rgb('+125+','+booster+',0)');
                    }
                    if($(this).context.className=="rowRight"){
                        $(this).find('p').each (function() {$(this).context.innerText=(that.q[row][col][1]).toFixed(4);});
                        var booster=Math.floor((qMatris[row][col][1]));
                        if(Math.floor((qMatris[row][col][1]))+boost<225)
                            booster=Math.floor((qMatris[row][col][1]))+boost;
                        $(this).css("background-color", 'rgb('+125+','+booster+',0)');
                    }
                    if($(this).context.className=="rowDown"){
                        $(this).find('p').each (function() {$(this).context.innerText=(that.q[row][col][2]).toFixed(4);});
                        var booster=Math.floor((qMatris[row][col][2]));
                        if(Math.floor((qMatris[row][col][2]))+boost<225)
                            booster=Math.floor((qMatris[row][col][2]))+boost;
                        $(this).css("background-color", 'rgb('+125+','+booster+',0)');
                    }
                    if($(this).context.className=="rowLeft"){
                        $(this).find('p').each (function() {$(this).context.innerText=(that.q[row][col][3]).toFixed(4);});
                        var booster=Math.floor((qMatris[row][col][3]));
                        if(Math.floor((qMatris[row][col][3]))+boost<225)
                            booster=Math.floor((qMatris[row][col][3]))+boost;
                        $(this).css("background-color", 'rgb('+125+','+booster+',0)');
                    }
                }); 
            });
        });        

    }
    // Renklendirme yapılabilmesi için 0-255 sayıları arasına dönüşüm yapılmasını sağlayan fonksiyon.
    normalizeQmatris(normalizeQmatris){
        var max=0;
        for(var i = 0; i < this.Q_SIZE; i++)
            for(var j = 0; j < this.Q_SIZE; j++)
                for(var k = 0; k< 4; k++)
                if(normalizeQmatris[i][j][k]>max) max=normalizeQmatris[i][j][k];
                
        for(var i = 0; i < this.Q_SIZE; i++)
            for(var j = 0; j < this.Q_SIZE; j++)
                for(var k = 0; k< 4; k++)
                    normalizeQmatris[i][j][k]=(normalizeQmatris[i][j][k]/max)*255.0;
                
        return normalizeQmatris;
    }

    // q learnin içerisindeki max (q states) durumunu sağlayan fonksiyon aksiyonun maxx q değerini döndürür.
    maxActionState(row,col,value){
        var up,left,down,right;
        up=this.q[row][col][0];
        left=this.q[row][col][1];
        down=this.q[row][col][2];
        right=this.q[row][col][3];
        return Math.max(up,left,down,right);      
    }

    // genel olarak hesaplanan q matrisinin consola aktarımı.
    showResult(){
        console.log("Q Matrix values:");
        for(var i = 0; i < this.Q_SIZE; i++){
             var text="";
            for(var j = 0; j < this.Q_SIZE; j++)
                text+=this.q[i][j] + ",      ";
            
            console.log(text);
        } 
        console.log("\n");
    }
    
    //programa başlangıç komutunu veren kod.
    start(){
        var that=this;
        this.train().done(function(){
            window.matrisQ=that.q;
            $('.saveResult').css('display', 'inline-block');
            that.showResult();
        });
        
        return;
    }
    toString(){
        return "Q_SIZE: "+this.Q_SIZE+"\nITERATIONS: "+this.ITERATIONS+"\nR: "+this.R;
        return;
    }
};
