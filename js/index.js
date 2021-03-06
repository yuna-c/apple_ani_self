/*
1.장면을 나눈다
2.장면별로 애니메이션을 처리하도록 한다.
*/

//1.즉시 호출 배열 함수(함수 자동 호출)
//(function() {}) ();  전역변수 바람직X 
(() =>{ // 1-1. 지역변수

    let YOffset = 0; // 4-2.변수화 window.pageYOffset 대신 쓸 변수
    let prevScrollHeight = 0; // 4-4. 현재 스크롤 위치(YOffset)보다 이전에 위치한 스크롤 섹션들의 스크롤 높이의 값
    let currentScene = 0; // 4-5.현재 활성화된(눈 앞에 보고있는) 씬(scroll-section)
    // 13. currentScene을 증가/감소 시키는 함수에서 scene이 바뀌는 순간 무시하는 함수
    let enterNewScene = false; // 13-1. 새로운 scene이 시작되는 순간 true

    // 38. 스크롤 가속도
    let acc = 0.1;
    let delayedYOffset = 0;
    let rafId;
    let rafState;

    const sceneInfo = [//배열 
        {   
            //0
            type: 'sticky',  //1-0-3.타입 
            heightNum: 5,    //1-0-2.브라우저 높이의 5배 scrollHeight 세팅
            scrollHeight: 0, //1-0-1.스크롤 높이
            objs: { //4.scroll-section 객체
                container: document.querySelector('#scroll-section-0'),
                // 7. css 줄 ani class 가져오기
                messageA: document.querySelector('#scroll-section-0 .main-message.a'),
                messageB: document.querySelector('#scroll-section-0 .main-message.b'),
                messageC: document.querySelector('#scroll-section-0 .main-message.c'),
                messageD: document.querySelector('#scroll-section-0 .main-message.d'),
                // 19. 비디오 삽입
                canvas: document.querySelector('#video-canvas-0'), // 비디오 객체
                context: document.querySelector('#video-canvas-0').getContext('2d'),// context 객체
                videoImages: [], // 비디오 배열
            },
            values: { // 8. 어떤 css값을 어떤식으로 넣을건지 

                // 19-1. 이미지 갯수, 시퀀스대로 960번까지 
                videoImageCount: 300, // 0~299
                imageSequence: [0, 299], // 이미지 순서

                // 24.캔버스 부드럽게 사라지게 
                canvas_opacity: [1, 0, { start: 0.9, end: 1 }],

                // 8-1.시작값, 끝값(스크롤 중간 값 계산해서 넣을꺼야)
                messageA_opacity_in: [0, 1, { start: 0.1, end: 0.2 }], // 8-2. scene이 끝날 때 ani같이 끝나는 걸로, messageA의 css 값을 세팅 10%~20% 지점 나옴
                // 13-5. 세번 째 원소 = 타이밍(객체), 애니메이션 재생되는 구간(비율이기 때문에 소수점)
                messageB_opacity_in: [0, 1, { start: 0.3, end: 0.4 }],
                messageC_opacity_in: [0, 1, { start: 0.5, end: 0.6 }],
                messageD_opacity_in: [0, 1, { start: 0.7, end: 0.8 }],

                messageA_opacity_out: [1, 0, { start: 0.25, end: 0.3 }],
                messageB_opacity_out: [1, 0, { start: 0.45, end: 0.5 }],
                messageC_opacity_out: [1, 0, { start: 0.65, end: 0.7 }],
                messageD_opacity_out: [1, 0, { start: 0.85, end: 0.9 }],

                // 16. translateY 등장할 때 세팅
                messageA_translateY_in: [20, 0, { start: 0.1, end: 0.2 }], // 20% ~ 0%, 타이밍 
                messageB_translateY_in: [20, 0, { start: 0.3, end: 0.4 }],
                messageC_translateY_in: [20, 0, { start: 0.5, end: 0.6 }],
                messageD_translateY_in: [20, 0, { start: 0.7, end: 0.8 }],

                messageA_translateY_out : [0, -20, { start: 0.4, end: 0.45}], // 16-1. out
                messageB_translateY_out: [0, -20, { start: 0.45, end: 0.5 }],
                messageC_translateY_out: [0, -20, { start: 0.65, end: 0.7 }],
                messageD_translateY_out: [0, -20, { start: 0.85, end: 0.9 }],
            }
        },
        {   
            //1
            type: 'normal',
            //heightNum: 5, normal no필요
            scrollHeight: 0, 
            objs:{ 
                container: document.querySelector('#scroll-section-1'),
                content: document.querySelector('#scroll-section-1 .description')
            },
        },
        {   
            //2
            type: 'sticky',
            heightNum: 5,
            scrollHeight: 0, 
            objs:{ 
                container: document.querySelector('#scroll-section-2'),
                messageA: document.querySelector('#scroll-section-2 .a'),
                messageB: document.querySelector('#scroll-section-2 .b'),
                messageC: document.querySelector('#scroll-section-2 .c'),
                pinB: document.querySelector('#scroll-section-2 .b .pin'),
                pinC: document.querySelector('#scroll-section-2 .c .pin'),

                // 25-1 이미지 객체
                canvas: document.querySelector('#video-canvas-1'),
				context: document.querySelector('#video-canvas-1').getContext('2d'),
				videoImages: []
            },
            values: {
                // 25-2. 이미지 갯수
                videoImageCount: 960,
				imageSequence: [0, 959],
				canvas_opacity_in: [0, 1, { start: 0, end: 0.1 }],
				canvas_opacity_out: [1, 0, { start: 0.95, end: 1 }],

                messageA_translateY_in: [20, 0, { start: 0.15, end: 0.2 }],
                messageB_translateY_in: [30, 0, { start: 0.6, end: 0.65 }],
                messageC_translateY_in: [30, 0, { start: 0.87, end: 0.92 }],
                messageA_opacity_in: [0, 1, { start: 0.25, end: 0.3 }],
                messageB_opacity_in: [0, 1, { start: 0.6, end: 0.65 }],
                messageC_opacity_in: [0, 1, { start: 0.87, end: 0.92 }],
                messageA_translateY_out: [0, -20, { start: 0.4, end: 0.45 }],
                messageB_translateY_out: [0, -20, { start: 0.68, end: 0.73 }],
                messageC_translateY_out: [0, -20, { start: 0.95, end: 1 }],
                messageA_opacity_out: [1, 0, { start: 0.4, end: 0.45 }],
                messageB_opacity_out: [1, 0, { start: 0.68, end: 0.73 }],
                messageC_opacity_out: [1, 0, { start: 0.95, end: 1 }],
                pinB_scaleY: [0.5, 1, { start: 0.6, end: 0.65 }],
                pinC_scaleY: [0.5, 1, { start: 0.87, end: 0.92 }]
            }
        },
        {   
            //3
            type: 'sticky',
            heightNum: 5,
            scrollHeight: 0, 
            objs:{ 
                container: document.querySelector('#scroll-section-3'), 
                canvasCaption: document.querySelector('.canvas-caption'),
                // 26. 이미지 객체
                canvas: document.querySelector('.image-blend-canvas'),
                context: document.querySelector('.image-blend-canvas').getContext('2d'),

                // 27. 이미지 경로 담아주기
                imagesPath: [
                    './images/blend-image-1.jpg',
                    './images/blend-image-2.jpg'
                ],
                images: [], // 빈배열

            },
            values: {
                // 30-2. sceneinfo 배열에 흰 박스의 x 좌표 세팅
                rect1X: [ 0, 0, { start: 0, end: 0} ],
                rect2X: [ 0, 0, { start: 0, end: 0} ],
                // 35. 이미지 블렌딩 Y좌표
                blendHeight: [ 0, 0, { start: 0, end: 0 } ],
                // 36. 이미지 블렌딩 후 캔버스 스케일
                canvas_scale: [ 0, 0, { start: 0, end: 0 } ],
                // 39. 마지막 문단 애니메이션, 위치
                canvasCaption_opacity: [ 0, 1, { start: 0, end: 0 } ],
				canvasCaption_translateY: [ 20, 0, { start: 0, end: 0 } ],
                rectStartY: 0, // 30-7. 한번만 스크롤하면 값이 들어가게(기준점)
            }
        }
    ]; 
    // 20. 이미지 배열 함수
    function setCanvasImages(){
        let imgElem; // 20-1. 이미지 객체
        for (let i = 0; i < sceneInfo[0].values.videoImageCount; i++) { // 0 ~ 299
            //sceneInfo 정보 활용하기 위해
            //imgElem = document.createElement('img');
            imgElem = new Image();
            imgElem.src = `./video/001/IMG_${6726 + i}.JPG`;
            // 20-2. 
            sceneInfo[0].objs.videoImages.push(imgElem);
        }
        // 25-3. 이미지 2 배열화
        let imgElem2;
		for (let i = 0; i < sceneInfo[2].values.videoImageCount; i++) {
			imgElem2 = new Image();
			imgElem2.src = `./video/002/IMG_${7027 + i}.JPG`;
			sceneInfo[2].objs.videoImages.push(imgElem2);
		}
        // 28.이미지 블랜딩 파일 가져오기
        let imgElem3;
        for (let i = 0; i < sceneInfo[3].objs.imagesPath.length; i++) {
            imgElem3 = new Image();
			imgElem3.src = sceneInfo[3].objs.imagesPath[i];
			sceneInfo[3].objs.images.push(imgElem3);
        }
        //console.log(sceneInfo[3].objs.images);
    }
    //console.log(sceneInfo[0].objs.videoImages);
    

    // 40. 메뉴 스크롤 고정
    function checkMenu() {
        if (YOffset > 44){ // 현재 문서전체의 스크롤된 위치 
            document.body.classList.add('local-nav-sticky');
        } else {
            document.body.classList.remove('local-nav-sticky');
        }
    }

    // 2. 함수생성
    function setLayout(){
        //각 스크롤 섹션의 높이 세팅(normal/sticky)
        for (let i = 0; i < sceneInfo.length; i++) { // 2-1.i=0 이고 sceneinfo의 갯수 +1

            // 17. sticky 높이 
            if (sceneInfo[i].type === 'sticky') {
                sceneInfo[i].scrollHeight = sceneInfo[i].heightNum * window.innerHeight; // 2-2.windowscroll 높이
                sceneInfo[i].objs.container.style.height = `${sceneInfo[i].scrollHeight}px`; // 2-3.컨테이너scrollheight 세팅
            // `문자열` = 백틱 (${변수, 값})
            } else if (sceneInfo[i].type === 'normal')  {
				sceneInfo[i].scrollHeight = sceneInfo[i].objs.container.offsetHeight;
			}
            sceneInfo[i].objs.container.style.height = `${sceneInfo[i].scrollHeight}px`;
            
        }
        //console.log(sceneInfo);  

        // 6.currentScene 자동 세팅 기능
        YOffset = window.pageYOffset; // 6-6 변수 통일감 세팅

        let totalScrollHeight = 0; 
        for (let i = 0; i < sceneInfo.length; i++) {
            totalScrollHeight += sceneInfo[i].scrollHeight;  // 6-1. sceneInfo의 scrollheight를 더한 값을 넣기
            if (totalScrollHeight >= YOffset) { // 6-2.현재 스크롤 위치랑 비교 , totalScrollHeight가 현재 scroll위치보다 크거나 같을 때 멈춰줌
                currentScene = i; // 6-4. currentScene을 i로 세팅
                break; // 6-3. 멈추기
            }
        }
        // 6-5. 바디에 show-scene 번호 작업 
        document.body.setAttribute('id', `show-scene-${currentScene}`);

        // 22. width,hegiht 맞추기
        const heightRatio = window.innerHeight / 1080; // 22-1. window.innerheight를 맞추기
        sceneInfo[0].objs.canvas.style.transform = `translate3d(-50%, -50%, 0) scale(${heightRatio})`; //객체로 가져오기(창 사이즈 높이에 딱 맞춰서 캔버스 크기 조정) + 센터정렬translate3d(X,Y,Z),
		sceneInfo[2].objs.canvas.style.transform = `translate3d(-50%, -50%, 0) scale(${heightRatio})`;
    }

    /* 처음부터 끝까지 재생되는것
    // 10. 9다음 8-2의 scroll값 애니 계산하는 함수 
    function calcValues(values, currentYOffset) {
        // values 매개변수 = opcity값 0,1 변화의 시작과 끝 값, currentYOffset 매개변수 = 현재 얼마나 스크롤 됬는지 
        // 10-1. 현재 scrollsection에서 얼만큼 스크롤이 됬는지 비율 구하기

        // 11.변수 세팅
        let rv;
        //const scrollHeight = sceneInfo[currentScene].scrollHeight;
        // 11-2. 현재 씬에서 얼만큼 스크롤 됬는지 값 구하기 (현재 씬의 전체의 범위 분의 현재 얼만큼 스크롤 됬는지currentYOffset)
        let scrollRatio = currentYOffset / sceneInfo[currentScene].scrollHeight; // 현재 씬(스크롤섹션)에서 스크롤된 범위를 비율로 구하기
        // 11-3. return scrollRatio; 값 확인 

        //console.log( values.messageA_opacity );

        // 11-4. 스크롤 비율을 값의 전체 범위에 곱함, parseInt() 소숫점 제거[정수처리]
        //rv = parseInt(scrollRatio * 300); // 11-5. values2-values1
        rv = scrollRatio * (values[1] - values[0]) + values[0];

        return rv;
        
    }
    */

    /* 13-6. 타임라인 별로 재생하게 수정, 분기처리 */
    function calcValues(values, currentYOffset) {
        let rv;
        
        // 13-9. 상수
        const scrollHeight = sceneInfo[currentScene].scrollHeight;
		const scrollRatio = currentYOffset / scrollHeight;

        // 13-7 분기처리
        if( values.length === 3 ){
            //start ~ end 사이의 애니메이션 실행
            // 13-8. 스크롤 시점 구하기 *(곱하기)
            const partScrollStart = values[2].start * scrollHeight;
            const partScrollEnd = values[2].end * scrollHeight;
            const partScrollHeight = partScrollEnd - partScrollStart;  

            if (currentYOffset >= partScrollStart && currentYOffset <= partScrollEnd) { //만약 사이구간에 들어왔을 경우 && partScrollStart보다 크거나 같고 , partScrollend보다 작거나 같으면
                // 13-9. 부분 스크롤 영역 (전체 - 스크롤 영역) 
				rv = (currentYOffset - partScrollStart) / partScrollHeight * (values[1] - values[0]) + values[0];
			} else if (currentYOffset < partScrollStart) { // partScrollStart이 작으면 초깃값 0
				rv = values[0];
			} else if (currentYOffset > partScrollEnd) { // partScrollEnd이 크면 1
				rv = values[1];
			}
            
        } else {
            rv = scrollRatio * (values[1] - values[0]) + values[0];
        }

        return rv;
        
    }

    // 9. 애니메이션 처리 함수
    /*
    function playAnimation() {
        // 10-4. opacity 변수 처리
		const objs = sceneInfo[currentScene].objs; //sceneInfo.objs 변수 DOM
		const values = sceneInfo[currentScene].values; //sceneInfo.values 변수, 값
        const currentYOffset = YOffset - prevScrollHeight; // 10-8. YOffest - prevScrollHeight(현재 scene에서 얼마나 스크롤 했는지 나옴)
        const scrollHeight = sceneInfo[currentScene].scrollHeight; // 15-1. 스크롤 된 나머지 값
        const scrollRatio = currentYOffset / scrollHeight; // 15-3 위의 변수로 치환
        //const scrollRatio = (yOffset - prevScrollHeight) / scrollHeight; 안됨 //15. 현재 씬에서 얼마나 스크롤 되었는지, yOffset(전체 문서에서 현재 스크롤 값) - prevScrollHeight / 현재 씬의 scrollHeight
        
        // 11-6 values 값 찍히는 지
        //console.log(values.messageA_opacity);
        // 10-7. values 찍히는 지 보기 
        //console.log(currentScene, currentYOffset);

        //12. 현재 활성화 된 씬 출력 console.log(currentScene);
        // 13-5. console.log(currentScene);
        switch (currentScene){
            // 9-1. 각 씬에 해당되는 애들만 play
            case 0: 
                //console.log('0 play');
                // 10-2. css
                // 11-8. calcValues();
                //let messageA_opacity_0 = sceneInfo[0].values.messageA_opacity[0]; // 10-3. messageA_opacity: [0]
                //let messageA_opacity_1 = sceneInfo[1].values.messageA_opacity[1]; // 10-3. messageA_opacity: [1]
                // 11-7. let messageA_opacity_0 = values.messageA_opacity[0]; // 10-5. 쓰기 편하게
                // 11-7. let messageA_opacity_1 = values.messageA_opacity[1];
                //const messageA_opacity_in = calcValues(values.messageA_opacity_in, currentYOffset);
                //const messageA_opacity_out = calcValues(values.messageA_opacity_out, currentYOffset); // 14-1. out 변수처리
                // 16-2 translateY 세팅
                //const messageA_translateY_in = calcValues(values.messageA_translateY_in, currentYOffset);
                //const messageA_translateY_out = calcValues(values.messageA_translateY_out, currentYOffset);

                // 15-2. scrollRatio가 0.22 보다 작거나 같으면
                if (scrollRatio <= 0.22) {
                    // in
                    objs.messageA.style.opacity =calcValues(values.messageA_opacity_in, currentYOffset);
                    objs.messageA.style.transform = `translateY(${calcValues(values.messageA_opacity_out, currentYOffset)}%)`; // 16-3. translateY
                } else {
                    // out
                    objs.messageA.style.opacity =calcValues(values.messageA_opacity_out, currentYOffset);
                    objs.messageA.style.transform = `translateY(${calcValues(values.messageA_translateY_out, currentYOffset)}%)`; // 16-3. translateY
                }
                // 14-2. 조건이 겹침 objs.messageA.style.opacity = messageA_opacity_out; 
                // 10-6. 값 찍히는지 보기 console.log( messageA_opacity_0, messageA_opacity_1);
                // 10-8. 호출, 12-1. opacity값 출력
                console.log(messageA_opacity_out);
                //console.log( calcValues(values.messageA_opacity, currentYOffset) );
                break;
            case 1:
                //console.log('1 play');
                break;
            case 2:
                //console.log('2 play');
                break;
            case 3:
                //console.log('3 play');
                break;
        }
    }
    */

    //18 애니메이션 정리
    function playAnimation() {
        // 10-4. opacity 변수 처리
		const objs = sceneInfo[currentScene].objs;
		const values = sceneInfo[currentScene].values; 
        const currentYOffset = YOffset - prevScrollHeight; 
        const scrollHeight = sceneInfo[currentScene].scrollHeight;
        const scrollRatio = currentYOffset / scrollHeight;
      
        switch (currentScene){
            case 0: 
                // 21.시퀀스 찍기
                //let sequence = Math.round(calcValues(values.imageSequence, currentYOffset)); //math.round 정수 반올림 처리
                //console.log(sequence);
                // 21-1. 컨텍스 트 개체 그리기
                //objs.context.drawImage(objs.videoImages[sequence], 0, 0);// 해당 이미지 객체, x, y, width, height
                // 24-1 투명도 적용
                objs.canvas.style.opacity = calcValues(values.canvas_opacity, currentYOffset);
                
                if (scrollRatio <= 0.22) {
                    // in
                    objs.messageA.style.opacity =calcValues(values.messageA_opacity_in, currentYOffset);
                    objs.messageA.style.transform = `translate3d(0, ${calcValues(values.messageA_translateY_in, currentYOffset)}%, 0)`; // 16-3. translateY
                      //(X), ${Y}%, Z (3d 붙은 애들은 퍼포먼스 좋고, 하드웨어 가속 보장)
                } else {
                    // out
                    objs.messageA.style.opacity =calcValues(values.messageA_opacity_out, currentYOffset);
                    objs.messageA.style.transform = `translate3d(0, ${calcValues(values.messageA_translateY_out, currentYOffset)}%, 0)`; // 16-3. translateY
                }
                //console.log(messageA_opacity_out);

                if (scrollRatio <= 0.42) {
                    // in
                    objs.messageB.style.opacity = calcValues(values.messageB_opacity_in, currentYOffset);
                    objs.messageB.style.transform = `translate3d(0, ${calcValues(values.messageB_translateY_in, currentYOffset)}%, 0)`;
                } else {
                    // out
                    objs.messageB.style.opacity = calcValues(values.messageB_opacity_out, currentYOffset);
                    objs.messageB.style.transform = `translate3d(0, ${calcValues(values.messageB_translateY_out, currentYOffset)}%, 0)`;
                }
    
                if (scrollRatio <= 0.62) {
                    // in
                    objs.messageC.style.opacity = calcValues(values.messageC_opacity_in, currentYOffset);
                    objs.messageC.style.transform = `translate3d(0, ${calcValues(values.messageC_translateY_in, currentYOffset)}%, 0)`;
                } else {
                    // out
                    objs.messageC.style.opacity = calcValues(values.messageC_opacity_out, currentYOffset);
                    objs.messageC.style.transform = `translate3d(0, ${calcValues(values.messageC_translateY_out, currentYOffset)}%, 0)`;
                }
    
                if (scrollRatio <= 0.82) {
                    // in
                    objs.messageD.style.opacity = calcValues(values.messageD_opacity_in, currentYOffset);
                    objs.messageD.style.transform = `translate3d(0, ${calcValues(values.messageD_translateY_in, currentYOffset)}%, 0)`;
                } else {
                    // out
                    objs.messageD.style.opacity = calcValues(values.messageD_opacity_out, currentYOffset);
                    objs.messageD.style.transform = `translate3d(0, ${calcValues(values.messageD_translateY_out, currentYOffset)}%, 0)`;
                }

                break;
            case 1:
                //console.log('1 play');
                break;
            case 2:
                // console.log('2 play');
                // 25-5. 이미지 객체 불러오기
                //let sequence2 = Math.round(calcValues(values.imageSequence, currentYOffset));
				//objs.context.drawImage(objs.videoImages[sequence2], 0, 0);

                //  25-6. 이미지 투명도 부드럽게 나누기
                if (scrollRatio <= 0.5) {
                    objs.canvas.style.opacity = calcValues(values.canvas_opacity_in, currentYOffset);
                } else {
                    objs.canvas.style.opacity = calcValues(values.canvas_opacity_out, currentYOffset);
                }

                if (scrollRatio <= 0.32) {
                    // in
                    objs.messageA.style.opacity = calcValues(values.messageA_opacity_in, currentYOffset);
                    objs.messageA.style.transform = `translate3d(0, ${calcValues(values.messageA_translateY_in, currentYOffset)}%, 0)`;
                } else {
                    // out
                    objs.messageA.style.opacity = calcValues(values.messageA_opacity_out, currentYOffset);
                    objs.messageA.style.transform = `translate3d(0, ${calcValues(values.messageA_translateY_out, currentYOffset)}%, 0)`;
                }

                if (scrollRatio <= 0.67) {
                    // in
                    objs.messageB.style.transform = `translate3d(0, ${calcValues(values.messageB_translateY_in, currentYOffset)}%, 0)`;
                    objs.messageB.style.opacity = calcValues(values.messageB_opacity_in, currentYOffset);
                    objs.pinB.style.transform = `scaleY(${calcValues(values.pinB_scaleY, currentYOffset)})`;
                } else {
                    // out
                    objs.messageB.style.transform = `translate3d(0, ${calcValues(values.messageB_translateY_out, currentYOffset)}%, 0)`;
                    objs.messageB.style.opacity = calcValues(values.messageB_opacity_out, currentYOffset);
                    objs.pinB.style.transform = `scaleY(${calcValues(values.pinB_scaleY, currentYOffset)})`;
                }

                if (scrollRatio <= 0.93) {
                    // in
                    objs.messageC.style.transform = `translate3d(0, ${calcValues(values.messageC_translateY_in, currentYOffset)}%, 0)`;
                    objs.messageC.style.opacity = calcValues(values.messageC_opacity_in, currentYOffset);
                    objs.pinC.style.transform = `scaleY(${calcValues(values.pinC_scaleY, currentYOffset)})`;
                } else {
                    // out
                    objs.messageC.style.transform = `translate3d(0, ${calcValues(values.messageC_translateY_out, currentYOffset)}%, 0)`;
                    objs.messageC.style.opacity = calcValues(values.messageC_opacity_out, currentYOffset);
                    objs.pinC.style.transform = `scaleY(${calcValues(values.pinC_scaleY, currentYOffset)})`;
                }

                // 33. currentScene 3에서 쓰는 캔버스를 미리 그려주기 시작
				if (scrollRatio > 0.9) {
					const objs = sceneInfo[3].objs;
					const values = sceneInfo[3].values;
					const widthRatio = window.innerWidth / objs.canvas.width;
					const heightRatio = window.innerHeight / objs.canvas.height;
					let canvasScaleRatio;

					if (widthRatio <= heightRatio) {
						// 캔버스보다 브라우저 창이 홀쭉한 경우
						canvasScaleRatio = heightRatio;
					} else {
						// 캔버스보다 브라우저 창이 납작한 경우
						canvasScaleRatio = widthRatio;
					}

					objs.canvas.style.transform = `scale(${canvasScaleRatio})`;
					objs.context.fillStyle = 'white';
					objs.context.drawImage(objs.images[0], 0, 0);

					// 캔버스 사이즈에 맞춰 가정한 innerWidth와 innerHeight
					const recalculatedInnerWidth = document.body.offsetWidth / canvasScaleRatio;
					const recalculatedInnerHeight = window.innerHeight / canvasScaleRatio;

					const whiteRectWidth = recalculatedInnerWidth * 0.15;
					values.rect1X[0] = (objs.canvas.width - recalculatedInnerWidth) / 2;
					values.rect1X[1] = values.rect1X[0] - whiteRectWidth;
					values.rect2X[0] = values.rect1X[0] + recalculatedInnerWidth - whiteRectWidth;
					values.rect2X[1] = values.rect2X[0] + whiteRectWidth;

					// 좌우 흰색 박스 그리기
					objs.context.fillRect(
						parseInt(values.rect1X[0]),
						0,
						parseInt(whiteRectWidth),
						objs.canvas.height
					);
					objs.context.fillRect(
						parseInt(values.rect2X[0]),
						0,
						parseInt(whiteRectWidth),
						objs.canvas.height
					);
				}
                
                break;
            case 3:
                //34. 스크롤이 되는 시점 구하기
                let step = 0; //시점이 변해야되니까 let

                //console.log('3 play');
                // 26-1. 스크롤 유동적 이미지(어떤 해상도에도 대응 할 수 있는 )
                // 가로 세로 모두 꽉 차게 하기위해 여기서 세팅(계산)
                // 원래 캔버스크기의 가로에 대한 브라우저의 폭의 비율 / 캔버스 원래 높이에 대한 브라우저의 높이에 대한 비율 
                const widthRatio = window.innerWidth / objs.canvas.width; // 캔버스 크기 / 브라우저의 폭
                const heightRatio = window.innerHeight / objs.canvas.height; // 캔버스 높이 / 브라우저의 높이
                
                //console.log(widthRatio, heightRatio);
                let canvasScaleRatio;

                //캔버스 크기랑 width,height를 비교해 얼만큼 조절을 할 껀지 정해줘야함

                if (widthRatio <= heightRatio) {// width가 height보다 작을 때
                    canvasScaleRatio = heightRatio; //height 비율 따라감 (캔버스보다 브라우저 창이 홀쭉한 경우)
                    //console.log(heightRatio, 'heightRatio 비율로 결정');
                } else {
                    canvasScaleRatio = widthRatio; //width 비율 따라감 (캔버스보다 브라우저 창이 납작한 경우)
                    //console.log(widthRatio,'widthRatio 비율로 결정');
                }
                // 캔버스 스케일을 canvasScaleRatio로 세팅 (비율 맞추기)
                objs.canvas.style.transform = `scale(${canvasScaleRatio})`;
                // 31. 캔버스 색 그리기
                objs.context.fillStyle = 'white';
                // 29. 캔버스로 이미지 그리기
                objs.context.drawImage(objs.images[0], 0, 0);//이미지즈 배열의 첫번째 객체 그리기

                // 30. 하얀 박스 그리기 캔버스사이즈에 맞춰 가정한 innerwidth,innerheight
                //const recalculatedInnerWidth = window.innerWidth / canvasScaleRatio; //1920
                //const recalculatedInnerHeight = window.innerHeight / canvasScaleRatio; //1080
                // 30-10. 스크롤바 미포함으로
                /*
                window.innerWidth
                2560
                document.body.offsetWidth
                2543
                */
                const recalculatedInnerWidth = document.body.offsetWidth / canvasScaleRatio; //1920
                const recalculatedInnerHeight = document.body.offsetWidth / canvasScaleRatio; //1080
                //console.log(recalculatedInnerWidth,recalculatedInnerHeight);

                //console.log('3 start');
                // 30-5. 3번 씬이 시작될때, -x좌표값으로, 캔버스 윗부분이 닿았을때 그림이 사라지게 
                //(움직인 y좌표값 구하기 = getBoundingClientRect() 화면상에 있는 오브젝트의 크기와 위치를 가져오는 메서드)
                //캔버스 top
                // 30-8. 만약 values의 rectStartY값이 세팅이 안되어있다면
                if(!values.rectStartY){
                    //values.rectStartY = objs.canvas.getBoundingClientRect().top;
                    //console.log(objs.canvas.getBoundingClientRect()); // 30-6.캔버스에 대한 정보를 시작시점에 한번만 가져오도록 변환
                    //console.log(values.rectStartY);
                    values.rectStartY = objs.canvas.offsetTop + (objs.canvas.height - objs.canvas.height * canvasScaleRatio) / 2;
                    // 30-11. 위에서 얼마나 떨어져 있느냐(고정값) + ( 원래캔버스 높이 - 줄어든 캔버스의 높이(원래캔버스높이 * 비율) ) /2; 탑값 얻어내기 -> 스케일이 늘려져 있어서 요소의 원래위치나 크기에 영향을 안줌(기본적으로 차지하는 공간영역이 안변함) 
                    console.log(values.rectStartY);
                    // 32. 흰박스 스타트 시점 정하기( 창사이즈의 절반 높이에 해당되는 정도를 전체 스크롤height에 대한 비율로 구함 )
                    values.rect1X[2].start = (window.innerHeight / 2) / scrollHeight;
                    values.rect2X[2].start = (window.innerHeight / 2) / scrollHeight;
                    values.rect1X[2].end = values.rectStartY / scrollHeight; //세번째 원소 타이밍()
                    values.rect2X[2].end = values.rectStartY / scrollHeight;
                }
                

                // 30-1. 하얀 박스의 폭 변수담기(상대값)
                const whiteRectWidth = recalculatedInnerWidth * 0.15;
               
                // 30-3. 흰 박스 계산
                values.rect1X[0] = (objs.canvas.width - recalculatedInnerWidth) / 2; //첫번째 박스x좌표, 캔버스width - 다시계산innerwidth /2
				values.rect1X[1] = values.rect1X[0] - whiteRectWidth; // 1번 인덱스, 벌어지는 화면 밖으로나가는 1번 박스가 화면 밖으로 나간다. ,좌표 - 끝쪽 폭
				values.rect2X[0] = values.rect1X[0] + recalculatedInnerWidth - whiteRectWidth; //두번째 박스 첫번째 박스 x좌표에서 다시계산innerwidth - 자기 폭
				values.rect2X[1] = values.rect2X[0] + whiteRectWidth;

                // 30-4. 좌우 흰색 박스 그리기 캔버스에서 사각형 그리는 인덱스 : fillRect
                //objs.context.fillRect(values.rect1X[0], 0, parseInt(whiteRectWidth), objs.canvas.height);// x, y, width(캔버스비율로 다시계산해서 정수처리), height
                //objs.context.fillRect(values.rect2X[0], 0, parseInt(whiteRectWidth), recalculatedInnerWidth);
                //objs.context.fillRect(values.rect2X[0], 0, parseInt(whiteRectWidth), objs.canvas.height);
                // 30-9 애니메이션 갱신 위해 calcvalues의 형식으로 변환
                objs.context.fillRect(parseInt(calcValues(values.rect1X, currentYOffset)), 
                    0, 
                    parseInt(whiteRectWidth), 
                    objs.canvas.height
                );
                objs.context.fillRect(parseInt(calcValues(values.rect2X, currentYOffset)), 
                    0, 
                    parseInt(whiteRectWidth), 
                    objs.canvas.height
                );

                if (scrollRatio < values.rect1X[2].end) { // 34-1. 캔버스가 브라우저 상단에 닿지 않았다면(흰박스가 덜 움직였다면) , 박스 애니메이션이 끝나는 지점보다 작으면
                    // 여기를 step1로
                    step = 1; 
                    //console.log('캔버스 닿기 전');
                    objs.canvas.classList.remove('sticky');
                } else {
                    step = 2;
                    //console.log('캔버스 닿은 후 😈');
                    // 35-2. blendHeight 세팅
                    values.blendHeight[0] = 0; 
                    values.blendHeight[1] = objs.canvas.height;
                    //스크롤 시점
                    values.blendHeight[2].start = values.rect1X[2].end; // 35-3. 이미지 1이 스크롤 다된 시점
                    values.blendHeight[2].end = values.blendHeight[2].start + 0.2; // 35-4. 스크롤 속도
                    const blendHeight = calcValues(values.blendHeight, currentYOffset); // 35-6.  35-5의 blendHeight;

                    // 35-1. blendHeight [ 0, 0, { start: 0, end: 0} ] 스크립트로 계산
                    objs.context.drawImage(objs.images[1],
                        0, objs.canvas.height - blendHeight, objs.canvas.width, blendHeight, // 35-5.소스 이미지에서 가져온것(blendHeight 계산의 결과값)
                        0, objs.canvas.height - blendHeight, objs.canvas.width, blendHeight
                    ); //이미지객체(비디오, 또다른 캔버스), x, y, width, height
                    
                    objs.canvas.classList.add('sticky');
                    //34-2. offset.Top - (원래캔버스height * 캔버스비율) /2px
                    objs.canvas.style.top = `${-(objs.canvas.height - objs.canvas.height * canvasScaleRatio) / 2}px`; 
                    // 조정된 캔버스 크기 = {-(원래 캔버스의 높이1080(1) - 원래 캔버스의 높이1080 * 확대축소비율0.7) /2}

                    //if() { step = 3; }

                    // 36-1. 캔버스 크기 축소
                    if(scrollRatio > values.blendHeight[2].end){
                        //console.log('축소시작');
                        values.canvas_scale[0] = canvasScaleRatio; //scale이 된 크기만큼 초기값
                        // 36-2. 브라우저의 폭이 관여하게끔 줄어듬 최종값
                        values.canvas_scale[1] = document.body.offsetWidth / (1.5 * objs.canvas.width);
                        //console.log(values.canvas_scale[0], values.canvas_scale[1]); // 초기, 최종

                        values.canvas_scale[2].start = values.blendHeight[2].end;
                        values.canvas_scale[2].end = values.canvas_scale[2].start + 0.2;

                        // 36-3. 실제 적용
                        objs.canvas.style.transform = `scale(${calcValues(values.canvas_scale, currentYOffset)})`;
                        // 37-2. 마진 탑 때문에 사라지는거 초기화
                        objs.canvas.style.marginTop = 0;
                    }
                    // 37. fixed 풀기
                    if(scrollRatio > values.canvas_scale[2].end && values.canvas_scale[2].end > 0){ // 1보다 작고(values.canvas_scale[2].end가 세팅되고), &&  0보다 클때
                        //console.log('scroll 시작');
                        objs.canvas.classList.remove('sticky');

                        // 37-1. margin-top 줘서 고정하기
                        objs.canvas.style.marginTop = `${scrollHeight * 0.4}px`;

                        // 39. 캔버스 캡션 컨트롤
                        values.canvasCaption_opacity[2].start = values.canvas_scale[2].end;
						values.canvasCaption_opacity[2].end = values.canvasCaption_opacity[2].start + 0.1;
						values.canvasCaption_translateY[2].start = values.canvasCaption_opacity[2].start;
						values.canvasCaption_translateY[2].end = values.canvasCaption_opacity[2].end;
						objs.canvasCaption.style.opacity = calcValues(values.canvasCaption_opacity, currentYOffset);
						objs.canvasCaption.style.transform = `translate3d(0, ${calcValues(values.canvasCaption_translateY, currentYOffset)}%, 0)`;
                    } else {
						objs.canvasCaption.style.opacity = values.canvasCaption_opacity[0];
					}

                }
                
                break;
        }
    } 

    // 4. 스크롤 섹션 판별
    function scrollLoop(){
        // 13-2. 스크롤 할 때마다 fasle 바뀔 때 true
        enterNewScene = false;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
        //YOffset = window.pageYOffset; // 4-3.스크롤 일어날때 y=pageYOffset
        //console.log(window.pageYOffset);// 4-1.몇픽셀 스크롤 되는지
        //console.log(YOffset);
        // 4-4.스크롤 4씬. 전체 값
        prevScrollHeight = 0; // 4.6 4구간의 scrollHeight 합 초기화
        for (let i = 0; i < currentScene; i++){
            //4-5.prevScrollHeight = prevScrollHeight + sceneInfo[i].scrollHeight;
            prevScrollHeight += sceneInfo[i].scrollHeight;
        }
        // 4.7 scrollheight하고있는 내 위치 
        //console.log(prevScrollHeight);

        // 52. remove scroll-effct-end
        if (delayedYOffset < prevScrollHeight + sceneInfo[currentScene].scrollHeight) {
            //현재 스크롤 된 위치가 이전스크롤 된것과 + 현재씬의 scrollheight보다 작을 때
            document.body.classList.remove('scroll-effect-end');
        }
        // 4.8 currentScene 값을 현재 위치에 따라 +1, -1시켜야 함
        if (delayedYOffset > prevScrollHeight + sceneInfo[currentScene].scrollHeight) {
            // 13-3. 바뀌는 순간
            enterNewScene = true; 
            
            // 51. 일반섹션 scroll-effect-end( 마지막 씬 이후에 처리 )
            if(currentScene === sceneInfo.length -1){
                document.body.classList.add('scroll-effect-end');
            }
            // 50. 일반 섹션 넣을 때, 더이상 늘어나지 않게 조건
            if(currentScene < sceneInfo.length -1){ //쿼런트 씬이 씬인포 랭스보다 1 작으면 index3까지
                currentScene++;
            }
           
            // 6-8.(바뀔때만 세팅)
            document.body.setAttribute('id', `show-scene-${currentScene}`);
        } 
        if (delayedYOffset < prevScrollHeight) {
            // 4-9. 브라우저 바운스 효과로 인해 마이너스가 되는 것을 방지(모바일) 
            if (currentScene === 0) return; 
            // 13-3. 바뀌는 순간
            enterNewScene = true; 
            currentScene--;

            // 6-9.(바뀔때만 세팅)
            document.body.setAttribute('id', `show-scene-${currentScene}`);
        }

        //console.log(currentScene);
        // 4-10.현재 활성 씬 반영
        // 6-7. document.body.setAttribute('id', `show-scene-${currentScene}`); // 4-11. 변수 + 문자열 = 백틱, currentScene현재 씬의 번호 (바뀔때만 세팅)
        
        // 13-4. scene 바뀔 때 실행 안됨
        if (enterNewScene) return;

        // 9-0
        playAnimation();
        
    }

    // 38-2. 스크롤 감속 루프 함수
    function loop() {
        delayedYOffset = delayedYOffset + (YOffset - delayedYOffset) * acc;
        //box.style.width = `${delayedYOffset}px`;
        if (!enterNewScene){ // false일 때 실행
            if (currentScene === 0 || currentScene === 2) {
				const currentYOffset = delayedYOffset - prevScrollHeight;
				const objs = sceneInfo[currentScene].objs;
				const values = sceneInfo[currentScene].values;
				let sequence = Math.round(calcValues(values.imageSequence, currentYOffset));
				if (objs.videoImages[sequence]) {
					objs.context.drawImage(objs.videoImages[sequence], 0, 0);
				}
            }
        }

        rafId = requestAnimationFrame(loop);

        if (Math.abs(YOffset - delayedYOffset) < 1) {
            cancelAnimationFrame(rafId);
            rafState = false;
        }
    }

    // 5. 현재 활성 씬 반영
    //window.addEventListener('load', setLayout); // 5-1. 로드되면 실행, load(이미지까지 싹다 로드후 실행) = DOMContentLoaded(HTML객체 구조만 로드 끝나면 실행)도 가능 
    // 23. 이벤트 화면상 딱 떴을때 만들기, 문서가 로드 되었을 때
    window.addEventListener('load', () =>{
        //44.디버거 
        //debugger; // 개발자 도구 열면 새로고침 했을 때 브레이크 걸려서 하나하나 자바스크립트 실행해가면서 실험

        // 43. 로딩 이벤트 
        document.body.classList.remove('before-load');
         
        setLayout();
        // 23-1. 다른 것들 초기화 작업(그리고 시작하게)
        sceneInfo[0].objs.context.drawImage(sceneInfo[0].objs.videoImages[0], 0, 0); //시퀀스 첫번째이미지 로드
        /*
        // 46. setTimeout으로 지연을 해야함
        setTimeout( () =>{
            // 45. 200픽셀만큼 스크롤 하는거 
            window.scrollTo(0, 100); // x, y 

            // 안전하게 여러번 조금씩 5픽셀씩 20번을 빠른속도로 
        }, 1000)
        */

        //47. 안전하게 여러번 조금씩 5픽셀씩 20번을 빠른속도로 실행 시키는 법(중간에 새로고침 했을때 이상현상 잡는 버그)
        let tempYOffset = YOffset; // window.pageYOffset
        let tempScrollCount = 0; //5픽셀씩 몇번 하는 지 변수
        // 연속으로 scroll 올릴 때 setInterval() 

        if(YOffset > 0){ //만약 yoffset이 0보다 크다면
            let siId = setInterval(() => { //실행 시킬 함수
                //console.log(tempScrollCount++);
                window.scrollTo(0 , tempYOffset); //y값을 현재 스크롤 위치
                tempYOffset += 1; // 5픽셀 더하기
    
                if(tempScrollCount > 20){ //20까지 되면 스톱
                    clearInterval(siId);// 멈추는 법
                }
                tempScrollCount ++; //1씩 늘려주고
            }, 20); // 초
        }
        

        window.addEventListener('scroll',() =>{ // 3-2. 몇 번째 섹션을 스크롤 하는지 판별, 익명함수
            YOffset = window.pageYOffset; // 4-3.스크롤 일어날때 y=pageYOffset
            scrollLoop();
            checkMenu();
    
            // 38-1. scroll 감속
            if (!rafState) {
                rafId = requestAnimationFrame(loop);
                rafState = true;
            }
        });

        // 3. 이벤트 적용 
        window.addEventListener('resize', () =>{ // 41. 리사이즈 대응
            if(window.innerWidth > 900){
                // 48. 이미지 블랜딩 오류 해결 방안
                window.location.reload();
                //setLayout();
                //sceneInfo[3].values.rectStartY = 0; // 초기화
            }
        }); // 3-1.윈도우 창 크기가 변할 때, setLayout 시작

        
        //42. orientationchange => 모바일 기기 최적화 할 수 있는
        window.addEventListener('orientationchange', () => { // 캔버스 크기 제대로 세팅하게 
            // 49. 스크롤 자체를 위로올리면 기기마다 대응 가능
            scrollTo(0, 0);
            //setTimeout(setLayout, 500); //한템포 늦춰서 실행시키게
             window.location.reload();
        }); 

        document.querySelector('.loading').addEventListener('transitionend', (e) =>{
            document.body.removeChild(e.currentTarget); //transitionEnd가 끝난 시점에
        });

    });

   
    setCanvasImages();
    
    //setLayout( // 3-0. 선언( sceneinfo에 있는 각 씬의 scrollheight를 잡아주고, 그 scrollheight값을 가지고 scrollsectionElement의 높이로 세팅)
    //); 
})();

console.log('^^');