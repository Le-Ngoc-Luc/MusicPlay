/*
    1. render song
    2. scoll top
    3. play / pause/ seek
    4. cd rotate
    5. next / prev
    6. Random
    7.Next / repeat when ended
    8. active song
    9. scoll active song into view
    10. play song when click
*/

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const player = $('.player');
const cd = $('.cd');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const progress = $('.progress');
const btnNext = $('.btn-next');
const btnPrev = $('.btn-prev');
const btnRandom = $('.btn-random');
const btnRepeat = $('.btn-repeat');
const playList = $('.playlist');

const songs = [
    {
        name: 'Em của ngày hôm qua',
        singer: 'Sơn Tùng',
        path: './music/EmCuaNgayHomQua-SonTungMTP-2882720.mp3',
        image: './image/Em_của_ngày_hôm_qua.png'
    },
    {
        name: 'Khó vẽ nụ cười',
        singer: 'ĐatG',
        path: './music/KhoVeNuCuoi-DatGDuUyen-6114344.mp3',
        image: './image/kho_ve_nu_cuoi.jpg'
    },
    {
        name: 'Mơ hồ',
        singer: 'Bùi anh tuấn',
        path: './music/MoHo-BuiAnhTuan-3264100.mp3',
        image: './image/mo_ho.jfif'
    },
    {
        name: 'Nơi này có anh',
        singer: 'Sơn Tùng',
        path: './music/NoiNayCoAnh-SonTungMTP-4772041.mp3',
        image: './image/noi-nay-co-anh.jpg'
    },
    {
        name: 'Nơi tình yêu bắt đầu',
        singer: 'Bùi anh tuấn',
        path: './music/NoiTinhYeuBatDau-BuiAnhTuan-1915267.mp3',
        image: './image/noi_tinh_yeu_bat_dau.jpg'
    },
    {
        name: 'Thu cuối',
        singer: 'Yanbi',
        path: './music/Thu-Cuoi-Yanbi-Mr-T-Hang-BingBoong.mp3',
        image: './image/thu_cuoi.jfif'
    }
]

const app = {
    currentIndex: 0,
    songs: songs,
    isplaying: false,
    isRandom: false,
    isRepeat: false,
    saveIndex: [],

    render() {
        // lấy ra danh sách bài hát và đẩy lên html
        const htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index = '${index}'>
                <div class="thumb"
                    style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}r</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
            `
        });
        playList.innerHTML = htmls.join('');
    },

    defineProperties() {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex];
            }
        })
    },

    // Lắng nghe xử lí các sự kiện
    handleEvents() {
        const cdWidth = cd.offsetWidth;
        _this = this;
        // Xử lí cd quay / dừng
        const cdThumbAnimate = cdThumb.animate([
            {transform: 'rotate(360deg'} //quay 360 độ
        ], {
            duration: 20000, //20giay
            iterations: Infinity
        })
        cdThumbAnimate.pause();


        // Xử lí phóng to/ thu nhở cd khi Scoll
        document.onscroll = () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newWidth = cdWidth - scrollTop;
            cd.style.width = newWidth > 0 ? newWidth + 'px' : '0px';
            cd.style.opacity = newWidth / cdWidth;
        }

        //xử lí khi click play
        playBtn.onclick = () => {
            if(_this.isplaying){
                audio.pause();
            } else{
                audio.play();
                
            }
        }

        //khi audio được play
        audio.onplay = () => {
            this.isplaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
        }

        // khi audio bị pause
        audio.onpause = () => {
            _this.isplaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }

        // Khi tiến độ bài hát bị thay đổi
        audio.ontimeupdate = () => {
            if(audio.duration){ // kiểm tra xem giá trị có phải NaN hay không
                const currentTime = audio.currentTime;
                const duration = audio.duration;
                const percent = (currentTime / duration) * 100;
                progress.value = percent;
            }
            
        }

        //Khi kéo thanh progress thì thay đổi time bài hát
        progress.onchange = () => {
            const seekTime =  progress.value * audio.duration / 100;
            audio.currentTime = seekTime;
        }

        //Khi nhấn next bài hát khác
        btnNext.onclick = () => {
            if(_this.isRandom){
                _this.random();
            }else{
                _this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        //Khi nhấn prev bài hát khác
        btnPrev.onclick = () => {
            if(_this.isRandom){
                _this.random();
            }else{
                _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        //Khi nhấn nút random
        btnRandom.onclick = () => {
            _this.isRandom = !_this.isRandom;
            btnRandom.classList.toggle('active', _this.isRandom); // khi _this.isRandom true thì thêm class và nguowck lại
        }

        // Xử lí next khi audio end
        audio.onended = () => {
            if(_this.isRepeat){
                audio.play();
            }else{
                btnNext.click();
            }
        }

        // Khi nhấn nút repeat
        btnRepeat.onclick = () => {
            _this.isRepeat = !_this.isRepeat;
            btnRepeat.classList.toggle('active', _this.isRepeat); // khi _this.isRepeat true thì thêm class và nguowck lại
        }

        // Khi nhấn vô playList
        playList.onclick = (e) => {
            //chọn lấy thẻ cha gần nhất có class là song và không có class active
            const songActive = e.target.closest('.song:not(.active)');
            if(songActive){
                    const index = Number(songActive.getAttribute('data-index'));
                    _this.currentIndex = index;
                    _this.loadcurrentSong();
                    _this.render();
                    audio.play();
                    
            }
        }
    },

    scrollToActiveSong(){
        const activeSong = document.querySelector('.song.active');
        if(activeSong){
            activeSong.scrollIntoView(
                {
                behavior:'smooth',
                block: 'nearest'
            }
            );
        }
    },

    loadcurrentSong() {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },

    nextSong(){
        this.currentIndex++;
        if(this.currentIndex >= this.songs.length){
            this.currentIndex = 0;
        }
        this.loadcurrentSong();
        this.render();
    },

    prevSong(){
        this.currentIndex--;
        if(this.currentIndex == 0){
            this.currentIndex = this.songs.length - 1;
        }
        this.loadcurrentSong();
        this.render();
    },
    
    random(){
        let newIndex = this.currentIndex;
        // Lấy ngẫu nhiên một giá trị index nếu index khác vs index hiện tại và index không nằm trong mảng
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (newIndex === this.currentIndex || this.saveIndex.includes(newIndex));

        this.saveIndex.push(newIndex);
        if(this.saveIndex.length === this.songs.length){
            this.saveIndex = [];
        }

        this.currentIndex = newIndex;
        this.loadcurrentSong();
    },

    start() {
        // Định nghĩa các thuộc tính cho Object
        this.defineProperties();

        // Lắng nghe, xử lí các sự kiện của (DOM events)
        this.handleEvents();

        // tải thông tin bài hát đầu tiên cào UI khi chạy ứng dụng
        this.loadcurrentSong();

        // Render lại playlist
        this.render();
    }
}

app.start();

