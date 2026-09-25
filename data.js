// CHARP Archive — album + artist data for the mockup
// Images from Wikimedia Commons. Ratings & reviews are fictional.
(function () {
  const U = [
    { name:'echoplex',    init:'EP', grad:'linear-gradient(135deg,#1c1c3e,#3b1fa8)' },
    { name:'staticfog',   init:'SF', grad:'linear-gradient(135deg,#164e63,#0284c7)' },
    { name:'velvetblast', init:'VB', grad:'linear-gradient(135deg,#450a0a,#dc2626)' },
    { name:'kira_m',      init:'KM', grad:'linear-gradient(135deg,#3b0764,#9333ea)' },
    { name:'josekm',      init:'JK', grad:'linear-gradient(135deg,#0c4a1e,#16a34a)' },
    { name:'noisegate',   init:'NG', grad:'linear-gradient(135deg,#1c3a5f,#2563eb)' },
    { name:'dustpan',     init:'DP', grad:'linear-gradient(135deg,#2d1b0e,#92400e)' },
  ];
  function rv(u, rating, text) { return { ...U[u], rating, text }; }

  window.ARCHIVE = [
    {
      artist:'My Bloody Valentine', album:'Loveless', year:1991, genre:'Shoegaze', tracks:9,
      image:'images/album-mbv-loveless.png',
      artistDesc:'Irish-English rock band',
      artistBio:'My Bloody Valentine are an Irish-English rock band formed in Dublin in 1983.',
      rating:4.8, reviewCount:89000,
      reviews:[
        rv(0,5,'only shallow is one of the most overwhelming album openers ever made'),
        rv(1,5,'sometimes is the most beautiful thing in human existence, full stop'),
        rv(2,5,'this completely changed what guitar music could sound like. forever'),
      ]
    },
    {
      artist:'Burial', album:'Untrue', year:2007, genre:'UK Garage / Ambient', tracks:11,
      image:'images/album-burial-untrue.jpg',
      artistDesc:'British electronic musician',
      artistBio:'William Bevan, known as Burial, is a British electronic musician from South London.',
      rating:4.9, reviewCount:38000,
      reviews:[
        rv(0,5,'archangel alone is worth a 5/5. the whole thing is haunting'),
        rv(1,5,'this is what 3am sounds like. perfect album'),
        rv(2,5,'the most emotionally devastating electronic album ever made'),
      ]
    },
    {
      artist:'Portishead', album:'Dummy', year:1994, genre:'Trip-hop', tracks:11,
      image:'images/album-portishead-dummy.png',
      artistDesc:'English trip-hop band',
      artistBio:'Portishead are an English electronic band formed in 1991 in Bristol.',
      rating:4.8, reviewCount:65000,
      reviews:[
        rv(0,5,'sour times is the song that made me take music seriously'),
        rv(1,5,"beth gibbons' voice is from another dimension. just stunning"),
        rv(2,4.5,'the template for every trip-hop album that followed'),
      ]
    },
    {
      artist:'Kendrick Lamar', album:'To Pimp a Butterfly', year:2015, genre:'Hip-hop / Jazz', tracks:16,
      image:'images/album-kendrick-tpab.png',
      artistDesc:'American rapper and songwriter',
      artistBio:'Kendrick Lamar Duckworth is an American rapper and songwriter from Compton, California.',
      rating:4.9, reviewCount:156000,
      reviews:[
        rv(0,5,'the greatest album of the decade. maybe the century so far'),
        rv(2,5,'every bar lands different depending on where you are in life'),
        rv(1,5,'mortal man\'s reveal still gives me chills on every listen'),
      ]
    },
    {
      artist:'David Bowie', album:'Blackstar', year:2016, genre:'Art rock / Jazz', tracks:7,
      image:'images/album-bowie-blackstar.png',
      artistDesc:'English musician and actor (1947–2016)',
      artistBio:'David Bowie was an English singer-songwriter and actor, widely considered one of the most influential musicians of the 20th century.',
      rating:4.8, reviewCount:78000,
      reviews:[
        rv(0,5,'he knew. this is a farewell and it\'s devastating and beautiful'),
        rv(1,5,'lazarus still destroys me. what a final statement'),
        rv(4,5,'one of the most meaningful albums of the century'),
      ]
    },
    {
      artist:'Sufjan Stevens', album:'Carrie and Lowell', year:2015, genre:'Folk / Chamber pop', tracks:11,
      image:'images/album-sufjan-carrielowell.jpg',
      artistDesc:'American musician',
      artistBio:'Sufjan Stevens is an American singer-songwriter and musician from Detroit, Michigan.',
      rating:4.8, reviewCount:54000,
      reviews:[
        rv(0,5,'death with dignity makes me cry every single time without exception'),
        rv(1,5,'the most personal and devastating thing he\'s ever made'),
        rv(3,5,'should i stay here or just leave? i think about this line constantly'),
      ]
    },
    {
      artist:'Massive Attack', album:'Mezzanine', year:1998, genre:'Trip-hop', tracks:11,
      image:'images/album-massiveattack-mezzanine.png',
      artistDesc:'English trip hop group',
      artistBio:'Massive Attack are an English trip hop collective formed in 1988 in Bristol, England.',
      rating:4.6, reviewCount:42000,
      reviews:[
        rv(0,5,'angel is one of the greatest songs ever recorded. no notes'),
        rv(1,4.5,'the paranoid tension throughout is incredibly well crafted'),
        rv(2,4.5,'dark, dense, claustrophobic in the best way'),
      ]
    },
    {
      artist:'Freddie Gibbs & Madlib', album:'Piñata', year:2014, genre:'Hip-hop', tracks:17,
      image:'images/album-freddiegibbs-pinata.jpg',
      artistDesc:'American rapper and record producer collaboration',
      artistBio:'Freddie Gibbs is an American rapper from Gary, Indiana, known for his precise delivery and gangster rap style.',
      rating:4.8, reviewCount:24000,
      reviews:[
        rv(0,5,'one of the greatest rap albums of the decade, full stop'),
        rv(2,5,"harold's flow on thuggin is just insane"),
        rv(4,4.5,'madlib beats + gibbs rapping = timeless'),
      ]
    },
    {
      artist:'Phoebe Bridgers', album:'Punisher', year:2020, genre:'Indie Folk', tracks:10,
      image:'images/album-phoebebridgers-punisher.png',
      artistDesc:'American singer-songwriter',
      artistBio:'Phoebe Bridgers is an American singer-songwriter and musician from Los Angeles, California.',
      rating:4.7, reviewCount:31000,
      reviews:[
        rv(0,5,'funeral is the most heartbreaking song i\'ve heard in years. she ruins you gently'),
        rv(1,5,'garden song alone deserves a 5/5. the whole album feels like a lucid dream'),
        rv(2,4,'savior complex on repeat for an hour. not sorry about it'),
      ]
    },
    {
      artist:'Weyes Blood', album:'Titanic Rising', year:2019, genre:'Art pop / Folk', tracks:10,
      image:'images/album-weyesblood-titanricrising.jpg',
      artistDesc:'American musician',
      artistBio:'Natalie Laura Mering, known professionally as Weyes Blood, is an American singer-songwriter and musician.',
      rating:4.7, reviewCount:38000,
      reviews:[
        rv(0,5,'movies is already a classic. natalie mering is on another level'),
        rv(5,4.5,'the songwriting here is so complete, so patient, so beautiful'),
        rv(3,5,'i cry every time the chorus of movies comes in. every time'),
      ]
    },
    {
      artist:'Kendrick Lamar', album:'good kid, m.A.A.d city', year:2012, genre:'Hip-hop', tracks:12,
      image:'images/album-kendrick-gkmc.jpg',
      artistDesc:'American rapper and songwriter',
      artistBio:'Kendrick Lamar Duckworth is an American rapper and songwriter from Compton, California.',
      rating:4.7, reviewCount:134000,
      reviews:[
        rv(2,5,'swimming pools is one of the most layered songs ever written'),
        rv(0,5,'the storytelling is unmatched, every track builds the world'),
        rv(4,4.5,'the best rap album to understand kendrick\'s genius'),
      ]
    },
    {
      artist:'Frank Ocean', album:'Blonde', year:2016, genre:'R&B / Alternative', tracks:17,
      image:'images/album-frankocean-blonde.jpeg',
      artistDesc:'American singer',
      artistBio:'Frank Ocean is an American singer, songwriter, and photographer from Long Beach, California.',
      rating:4.7, reviewCount:98000,
      reviews:[
        rv(0,5,'self control is the most perfect song of the 2010s'),
        rv(5,5,'a patient, difficult, devastatingly beautiful album'),
        rv(3,4.5,'took me five listens to understand and then i never wanted to stop'),
      ]
    },
    {
      artist:'Nirvana', album:'In Utero', year:1993, genre:'Alternative rock / Grunge', tracks:13,
      image:'images/album-nirvana-inutero.jpg',
      artistDesc:'American rock band (1987–1994)',
      artistBio:'Nirvana was an American rock band formed in Aberdeen, Washington, in 1987, consisting of Kurt Cobain, Krist Novoselic, and Dave Grohl.',
      rating:4.7, reviewCount:52000,
      reviews:[
        rv(0,5,'heart-shaped box is one of the most perfect songs ever written'),
        rv(5,4.5,'rape me was so misunderstood on release. stunning and complex'),
        rv(1,4.5,'dumb is the saddest track on the album and no one talks about it enough'),
      ]
    },
    {
      artist:'Smashing Pumpkins', album:'Siamese Dream', year:1993, genre:'Alternative rock', tracks:13,
      image:'images/album-smashingpumpkins-siamesedream.jpg',
      artistDesc:'American alternative rock band',
      artistBio:'The Smashing Pumpkins are an American alternative rock band formed in Chicago, Illinois, in 1988.',
      rating:4.7, reviewCount:48000,
      reviews:[
        rv(0,5,'cherub rock is one of the greatest guitar intros in rock history'),
        rv(1,4.5,'today and disarm in the same album is just unfair'),
        rv(2,4.5,'corgan was writing the best songs of his life here'),
      ]
    },
    {
      artist:'Aphex Twin', album:'Selected Ambient Works Vol. II', year:1994, genre:'Ambient / Electronic', tracks:24,
      image:'images/album-aphextwin-saw2.jpg',
      artistDesc:'British electronic musician',
      artistBio:'Richard David James, known by the stage name Aphex Twin, is a British electronic musician.',
      rating:4.7, reviewCount:18000,
      reviews:[
        rv(0,5,'the most peaceful and unsettling thing i\'ve ever heard simultaneously'),
        rv(5,4.5,'ambient masterwork, no easy way into it but worth every listen'),
        rv(3,5,'put this on at 2am and just float away'),
      ]
    },
    {
      artist:'Weyes Blood', album:'And in the Darkness, Hearts Aglow', year:2022, genre:'Art pop / Folk', tracks:13,
      image:'images/album-weyesblood-heartsglow.png',
      artistDesc:'American musician',
      artistBio:'Natalie Laura Mering, known professionally as Weyes Blood, is an American singer-songwriter and musician.',
      rating:4.6, reviewCount:22000,
      reviews:[
        rv(0,5,"it's not just sad, it's apocalyptic in scope. masterwork"),
        rv(1,4.5,'children of the empire is devastating and gorgeous simultaneously'),
        rv(2,4.5,"a grief album for a world that doesn't know it's grieving yet"),
      ]
    },
    {
      artist:'Earl Sweatshirt', album:'Some Rap Songs', year:2018, genre:'Experimental hip-hop', tracks:15,
      image:'images/album-earlsweatshirt-somerapsongas.jpg',
      artistDesc:'American rapper',
      artistBio:'Thebe Neruda Kgositsile, known professionally as Earl Sweatshirt, is an American rapper from Los Angeles.',
      rating:4.6, reviewCount:28000,
      reviews:[
        rv(0,5,'grieving in real time, some of the most raw music i\'ve heard'),
        rv(5,4.5,'21 minutes and it says more than most albums say in an hour'),
        rv(2,4.5,"not for everyone but for those it hits, it hits hard"),
      ]
    },
    {
      artist:'JPEGMAFIA', album:'Veteran', year:2018, genre:'Experimental hip-hop', tracks:15,
      image:'images/album-jpegmafia-veteran.jpg',
      artistDesc:'American rapper and record producer',
      artistBio:'Barrington DeVaughn Hendricks, known as JPEGMAFIA, is an American rapper and record producer from Baltimore.',
      rating:4.6, reviewCount:18000,
      reviews:[
        rv(1,5,'x is gonna give it to ya alone proves he\'s untouchable'),
        rv(2,5,'the anger feels completely justified, production is insane'),
        rv(0,4.5,'changed what i thought rap production could sound like'),
      ]
    },
    {
      artist:'RADWIMPS', album:'Kimi no Na wa Soundtrack', year:2016, genre:'J-pop / Alternative', tracks:12,
      image:'images/album-radwimps-yourname.png',
      artistDesc:'Japanese rock band',
      artistBio:'Radwimps is a Japanese rock band formed in Kanagawa, Japan, in 2001.',
      rating:4.6, reviewCount:28000,
      reviews:[
        rv(3,4.5,'zen zen zense hits every time, doesn\'t matter if you\'ve seen the film'),
        rv(4,5,'nandemonaiya makes me cry even though i don\'t understand every lyric'),
        rv(0,4.5,'the way the music syncs with the film is once-in-a-decade filmmaking'),
      ]
    },
    {
      artist:'Asian Kung-Fu Generation', album:'Sol-fa', year:2004, genre:'J-rock / Alternative', tracks:13,
      image:'images/album-akfg-solfa.jpg',
      artistDesc:'Japanese alternative rock band',
      artistBio:'Asian Kung-Fu Generation is a Japanese alternative rock band formed in Kanagawa, Japan, in 1996.',
      rating:4.6, reviewCount:12000,
      reviews:[
        rv(0,4.5,'haruka kanata will always live in my head. classic opener'),
        rv(3,4.5,'one of the essential japanese rock albums, full stop'),
        rv(1,4.5,'the energy never lets up. perfect album for running'),
      ]
    },
    {
      artist:'Freddie Gibbs & Madlib', album:'Bandana', year:2019, genre:'Hip-hop', tracks:12,
      image:'images/album-freddiemadlib-bandana.jpeg',
      artistDesc:'American rapper and record producer collaboration',
      artistBio:'Freddie Gibbs is an American rapper from Gary, Indiana, known for his precise delivery and gangster rap style.',
      rating:4.7, reviewCount:31000,
      reviews:[
        rv(0,4.5,'madlib and freddie are just unbeatable together. every track lands'),
        rv(1,5,'criminal (pun intended) how overlooked this is'),
        rv(2,4.5,'the sequencing is immaculate, listens like a movie'),
      ]
    },
    {
      artist:'Yoko Kanno', album:'Cowboy Bebop Original Soundtrack', year:1998, genre:'Jazz / Electronic / Orchestral', tracks:24,
      image:'images/album-yokokanno-cowboybebop.jpg',
      artistDesc:'Japanese composer',
      artistBio:'Yoko Kanno is a Japanese composer, arranger, and musician, best known for her anime soundtracks.',
      rating:4.9, reviewCount:35000,
      reviews:[
        rv(0,5,'tank! is one of the greatest opening themes ever written. forever'),
        rv(1,5,'the range in this thing is staggering. jazz to ambient to rock'),
        rv(2,4.5,'even if you\'ve never seen bebop this album stands completely alone'),
      ]
    },
    {
      artist:'Tame Impala', album:'Currents', year:2015, genre:'Psychedelic pop', tracks:13,
      image:'images/album-tameimpala-currents.png',
      artistDesc:'Australian psychedelic music project',
      artistBio:'Tame Impala is an Australian psychedelic music project created by musician Kevin Parker.',
      rating:4.4, reviewCount:85000,
      reviews:[
        rv(4,4.5,"'cause i'm a man just dissolves you. the whole album does"),
        rv(1,4.5,'the synth work here is from another era, timeless'),
        rv(6,4,'emotionally intelligent in a way psych rock rarely is'),
      ]
    },
    {
      artist:'Mitski', album:'Puberty 2', year:2016, genre:'Indie rock', tracks:11,
      image:'images/album-mitski-puberty2.jpg',
      artistDesc:'American singer-songwriter',
      artistBio:'Mitski Miyawaki, known mononymously as Mitski, is an American singer-songwriter from Japan.',
      rating:4.5, reviewCount:43000,
      reviews:[
        rv(0,5,'your best american girl is one of the best songs of the decade'),
        rv(1,4.5,'nobody lives in the same emotional frequency as mitski. unreal'),
        rv(3,5,'if i could talk i\'d tell you that i miss you so bad it\'s crazy'),
      ]
    },
    {
      artist:'Phoebe Bridgers', album:'Stranger in the Alps', year:2017, genre:'Indie Folk', tracks:9,
      image:'images/album-phoebebridgers-stranger.png',
      artistDesc:'American singer-songwriter',
      artistBio:'Phoebe Bridgers is an American singer-songwriter and musician from Los Angeles, California.',
      rating:4.5, reviewCount:22000,
      reviews:[
        rv(0,5,'scott street is a perfect song. phoebe was already fully formed here'),
        rv(5,4.5,'funeral was technically on this before punisher. it was already devastating'),
        rv(1,4.5,'motion sickness alone announces a major artist. what a debut'),
      ]
    },
    {
      artist:'JPEGMAFIA', album:'LP!', year:2021, genre:'Experimental hip-hop', tracks:18,
      image:'images/album-jpegmafia-lp.jpg',
      artistDesc:'American rapper and record producer',
      artistBio:'Barrington DeVaughn Hendricks, known as JPEGMAFIA, is an American rapper and record producer from Baltimore.',
      rating:4.5, reviewCount:24000,
      reviews:[
        rv(5,4.5,'the aggression and vulnerability are perfectly balanced here'),
        rv(3,4.5,'bald! alone is worth the price of admission'),
        rv(0,4.5,'every sound choice is a statement. dense but rewarding'),
      ]
    },
    {
      artist:'Tyler, the Creator', album:'IGOR', year:2019, genre:'Neo-soul / Hip-hop', tracks:12,
      image:'images/album-tyler-igor.jpg',
      artistDesc:'American rapper and producer',
      artistBio:'Tyler Gregory Okonma, known professionally as Tyler, the Creator, is an American rapper, record producer, and director.',
      rating:4.5, reviewCount:72000,
      reviews:[
        rv(0,5,'gone gone / thank you is perfect. this whole album is perfect'),
        rv(1,4.5,'the genre-blending here is something else entirely'),
        rv(3,4.5,"a heartbreak album that doesn't feel like a heartbreak album"),
      ]
    },
    {
      artist:'Floating Points', album:'Crush', year:2019, genre:'Electronic', tracks:10,
      image:'images/album-floatingpoints-crush.png',
      artistDesc:'British musician and producer',
      artistBio:'Samuel Shepherd, known as Floating Points, is a British musician, DJ, and producer.',
      rating:4.5, reviewCount:12000,
      reviews:[
        rv(0,4.5,'argente is transcendent. what a debut'),
        rv(1,4.5,'electronic music that genuinely feels alive'),
        rv(6,4,'intricate without being cold, emotional without being saccharine'),
      ]
    },
    {
      artist:'Epik High', album:'Shoebox', year:2014, genre:'Korean hip-hop', tracks:14,
      image:'images/album-epikhigh-shoebox.png',
      artistDesc:'South Korean hip-hop group',
      artistBio:'Epik High is a South Korean hip-hop group consisting of Tablo, Mithra Jin, and DJ Tukutz.',
      rating:4.6, reviewCount:7000,
      reviews:[
        rv(3,4.5,'born hater alone is worth it. but the whole album is excellent'),
        rv(0,5,'tablo\'s storytelling on here is just next level'),
        rv(4,4.5,'one of their most emotionally varied records'),
      ]
    },
    {
      artist:'SZA', album:'Ctrl', year:2017, genre:'R&B / Alt-R&B', tracks:14,
      image:'images/album-sza-ctrl.png',
      artistDesc:'American singer-songwriter',
      artistBio:'Solána Imani Rowe, known professionally as SZA, is an American singer and songwriter from Maplewood, New Jersey.',
      rating:4.4, reviewCount:61000,
      reviews:[
        rv(2,4.5,'drew barrymore is still one of the best album openers in recent memory'),
        rv(0,4.5,'soft and wounded in ways most pop music doesn\'t allow itself to be'),
        rv(3,4,'go gina alone deserves a 10/10'),
      ]
    },
    {
      artist:'Daughters', album:"You Won't Get What You Want", year:2018, genre:'Noise rock / Post-punk', tracks:10,
      image:'images/album-daughters-youwontget.jpg',
      artistDesc:'American rock band',
      artistBio:'Daughters are an American noise rock band formed in Providence, Rhode Island, in 2002.',
      rating:4.7, reviewCount:11000,
      reviews:[
        rv(0,5,'the floorshow is fifteen minutes of controlled chaos and i love every second'),
        rv(1,4.5,'most intense album i\'ve heard in years, not always comfortable'),
        rv(2,5,'alexis marshall sounds like he\'s genuinely losing his mind. perfect'),
      ]
    },
    {
      artist:'Mitski', album:'Be the Cowboy', year:2018, genre:'Indie pop / Art rock', tracks:14,
      image:'images/album-mitski-bethecowboy.jpg',
      artistDesc:'American singer-songwriter',
      artistBio:'Mitski Miyawaki, known mononymously as Mitski, is an American singer-songwriter from Japan.',
      rating:4.4, reviewCount:38000,
      reviews:[
        rv(2,4.5,'nobody but mitski could write a song called geyser and make it devastating'),
        rv(0,4.5,'dancing is the best song of the year it came out. still is'),
        rv(4,4,'more polished than puberty 2 but equally painful'),
      ]
    },
    {
      artist:'Freddie Gibbs', album:'$oul $old $eparately', year:2022, genre:'Hip-hop', tracks:14,
      image:'images/album-freddiegibbs-soulsold.png',
      artistDesc:'American rapper',
      artistBio:'Freddie Gibbs is an American rapper from Gary, Indiana, known for his precise delivery and gangster rap style.',
      rating:4.3, reviewCount:12000,
      reviews:[
        rv(4,4,'black illuminati is one of his best hooks ever'),
        rv(5,4,'solid but doesn\'t hit as hard as pinata or bandana'),
        rv(3,4.5,'still miles ahead of most rap albums out there'),
      ]
    },
    {
      artist:'Earl Sweatshirt', album:'Doris', year:2013, genre:'Hip-hop', tracks:16,
      image:'images/album-earlsweatshirt-doris.jpg',
      artistDesc:'American rapper',
      artistBio:'Thebe Neruda Kgositsile, known professionally as Earl Sweatshirt, is an American rapper from Los Angeles.',
      rating:4.4, reviewCount:22000,
      reviews:[
        rv(0,4.5,'hive is still one of the best three-verse compositions in rap'),
        rv(1,4,'quiet genius, understated in a way most rap isn\'t'),
        rv(3,4.5,'the tyler feature is still one of my favorites'),
      ]
    },
    {
      artist:'Tame Impala', album:'Innerspeaker', year:2010, genre:'Psychedelic rock', tracks:10,
      image:'images/album-tameimpala-innerspeaker.png',
      artistDesc:'Australian psychedelic music project',
      artistBio:'Tame Impala is an Australian psychedelic music project created by musician Kevin Parker.',
      rating:4.3, reviewCount:42000,
      reviews:[
        rv(3,4,'feels like sun through your eyes. warm and overwhelming'),
        rv(5,4,'the more mellow cousin of lonerism, still essential'),
        rv(0,4.5,'lucidity is a perfect opener, sets everything up beautifully'),
      ]
    },
    {
      artist:'Skepta', album:'Konnichiwa', year:2016, genre:'Grime', tracks:12,
      image:'images/album-skepta-konnichiwa.jpg',
      artistDesc:'English rapper, producer and DJ',
      artistBio:'Joseph Junior Adenuga, known professionally as Skepta, is an English rapper, record producer, and DJ from Tottenham.',
      rating:4.4, reviewCount:15000,
      reviews:[
        rv(4,4.5,"that's not me is the grime anthem of the decade"),
        rv(3,4,'skepta was just on another level here, effortless'),
        rv(1,4.5,'grime at its purest and most powerful'),
      ]
    },
    {
      artist:'Arca', album:'Xen', year:2014, genre:'Electronic / Experimental', tracks:14,
      image:'images/album-arca-xen.jpg',
      artistDesc:'Venezuelan musician',
      artistBio:'Alejandra Ghersi Rodríguez, known professionally as Arca, is a Venezuelan musician, singer, songwriter, and record producer.',
      rating:4.3, reviewCount:8000,
      reviews:[
        rv(0,4.5,'arca\'s most intimate record, feels like a confession'),
        rv(1,4,'gorgeous and strange, exactly what experimental music should be'),
        rv(3,4,'the kind of record that stays with you for weeks'),
      ]
    },
    {
      artist:'Men I Trust', album:'Untourable Album', year:2020, genre:'Dream pop / Indie', tracks:17,
      image:'images/album-menitrust-untourable.jpeg',
      artistDesc:'Canadian indie band',
      artistBio:'Men I Trust is a Canadian indie band formed in Quebec City in 2014, consisting of Emma Proulx, Jessy Caron, and Dragos Chiriac.',
      rating:4.3, reviewCount:14000,
      reviews:[
        rv(3,4.5,'lauren\'s voice is the warmest sound in existence. this album proves it'),
        rv(6,4,'slow and gorgeous, great late night driving music'),
        rv(4,4,'the production is immaculate — every sound placed perfectly'),
      ]
    },
    {
      artist:'Snail Mail', album:'Lush', year:2018, genre:'Indie rock / Emo', tracks:10,
      image:'images/album-snailmail-lush.jpg',
      artistDesc:'Solo musical project of Lindsey Jordan',
      artistBio:'Snail Mail is the musical project of Lindsey Jordan, an American indie rock singer-songwriter from Baltimore.',
      rating:4.4, reviewCount:28000,
      reviews:[
        rv(0,4.5,'heat wave is the best song about loving someone who doesn\'t love you back'),
        rv(1,4.5,'lindsey jordan was 19 when she made this. terrifying'),
        rv(5,4,'pure and direct in a way emo rarely achieves anymore'),
      ]
    },
    {
      artist:'Epik High', album:'Map the Soul', year:2017, genre:'Korean hip-hop', tracks:10,
      image:'images/album-epikhigh-mapthesoul.jpg',
      artistDesc:'South Korean hip-hop group',
      artistBio:'Epik High is a South Korean hip-hop group consisting of Tablo, Mithra Jin, and DJ Tukutz.',
      rating:4.5, reviewCount:8000,
      reviews:[
        rv(3,4.5,'amor fati is one of tablo\'s best verses. album is immaculate'),
        rv(4,4.5,"they never run out of things to say and ways to say it"),
        rv(6,4,'the most ambitious thing they\'ve done in years'),
      ]
    },
    {
      artist:'Massive Attack', album:'Heligoland', year:2010, genre:'Trip-hop', tracks:10,
      image:'images/album-massiveattack-heligoland.png',
      artistDesc:'English trip hop group',
      artistBio:'Massive Attack are an English trip hop collective formed in 1988 in Bristol, England.',
      rating:4.1, reviewCount:16000,
      reviews:[
        rv(4,4,'not as perfect as mezzanine but still essential'),
        rv(5,4,'atlas air is genuinely stunning'),
        rv(3,3.5,'underrated compared to their earlier work'),
      ]
    },
    {
      artist:'Soccer Mommy', album:'Color Theory', year:2020, genre:'Indie rock / Dream pop', tracks:10,
      image:'images/album-soccermommy-colortheory.png',
      artistDesc:'American musician',
      artistBio:'Soccer Mommy is the solo project of Sophie Allison, an American singer-songwriter from Nashville, Tennessee.',
      rating:4.3, reviewCount:18000,
      reviews:[
        rv(3,4,'lucy alone is worth the price of admission'),
        rv(6,4,'earnest and unflinching, like a really honest diary entry'),
        rv(4,4,'still find new things to love on every listen'),
      ]
    },
    {
      artist:'SZA', album:'SOS', year:2022, genre:'R&B / Pop', tracks:23,
      image:'images/album-sza-sos.png',
      artistDesc:'American singer-songwriter',
      artistBio:'Solána Imani Rowe, known professionally as SZA, is an American singer and songwriter from Maplewood, New Jersey.',
      rating:4.1, reviewCount:52000,
      reviews:[
        rv(5,4,'kill bill is an instant classic but the album sags in the middle'),
        rv(4,3.5,'she expanded her range significantly but lost some intimacy'),
        rv(0,4,'snooze is just stunning, wish the whole album hit this hard'),
      ]
    },
    {
      artist:'James Blake', album:'James Blake', year:2011, genre:'Electronic soul / Post-dubstep', tracks:10,
      image:'images/album-jamesblake-selftitled.jpg',
      artistDesc:'English singer-songwriter',
      artistBio:'James Blake Litherland is an English singer, songwriter, and producer from London.',
      rating:4.4, reviewCount:28000,
      reviews:[
        rv(0,4.5,'the wilhelm scream is still the most haunting piece of music he\'s made'),
        rv(5,4,'the space between notes in this is as important as the notes themselves'),
        rv(2,4.5,'limit to your love ruined me. just absolutely destroyed me'),
      ]
    },
    {
      artist:'Mount Kimbie', album:'Cold Spring Fault Less Youth', year:2013, genre:'Electronic / Post-dubstep', tracks:10,
      image:'images/album-mountkimbie-coldspring.png',
      artistDesc:'English electronic music group',
      artistBio:'Mount Kimbie are an English electronic music duo formed in London in 2008.',
      rating:4.3, reviewCount:8000,
      reviews:[
        rv(5,4.5,'hang is one of the most beautiful songs of the decade'),
        rv(4,4,'post-dubstep that aged incredibly well'),
        rv(6,4,'cold and precise but surprisingly emotional'),
      ]
    },
    {
      artist:'Arca', album:'Mutant', year:2015, genre:'Electronic / Experimental', tracks:15,
      image:'images/album-arca-mutant.jpg',
      artistDesc:'Venezuelan musician',
      artistBio:'Alejandra Ghersi Rodríguez, known professionally as Arca, is a Venezuelan musician, singer, songwriter, and record producer.',
      rating:4.2, reviewCount:6000,
      reviews:[
        rv(3,4,'unsettling and gorgeous in equal measure'),
        rv(5,4,'genuinely alien music, there\'s nothing else like it'),
        rv(2,4,'not for the faint of heart but deeply rewarding'),
      ]
    },
    {
      artist:'James Blake', album:'Assume Form', year:2019, genre:'Electronic soul / R&B', tracks:11,
      image:'images/album-jamesblake-assumeform.jpg',
      artistDesc:'English singer-songwriter',
      artistBio:'James Blake Litherland is an English singer, songwriter, and producer from London.',
      rating:4.2, reviewCount:19000,
      reviews:[
        rv(4,4,'mile high is beautiful even if it\'s a bit more mainstream than his peak'),
        rv(6,3.5,'he found happiness and it shows, not always his best mode'),
        rv(3,4,'can\'t believe he got travis scott to do something genuinely moving'),
      ]
    },
    {
      artist:'Epik High', album:'Epik High Is Here', year:2021, genre:'Korean hip-hop', tracks:13,
      image:'images/album-epikhigh-ishere.jpeg',
      artistDesc:'South Korean hip-hop group',
      artistBio:'Epik High is a South Korean hip-hop group consisting of Tablo, Mithra Jin, and DJ Tukutz.',
      rating:4.4, reviewCount:9000,
      reviews:[
        rv(3,4.5,'rosario goes impossibly hard. the album is a statement'),
        rv(4,4,'they come back stronger every time'),
        rv(6,4,'the lyrics hit different if you understand korean culture'),
      ]
    },
    {
      artist:'Asian Kung-Fu Generation', album:'Hometown', year:2018, genre:'J-rock / Alternative', tracks:12,
      image:'images/album-akfg-hometown.jpg',
      artistDesc:'Japanese alternative rock band',
      artistBio:'Asian Kung-Fu Generation is a Japanese alternative rock band formed in Kanagawa, Japan, in 1996.',
      rating:4.3, reviewCount:7000,
      reviews:[
        rv(4,4,'more subdued than their early work but mature and considered'),
        rv(3,4,'yoru no mukou is quiet and beautiful, different from the old stuff'),
        rv(6,3.5,'longtime fans might be thrown but it\'s grown on me'),
      ]
    },
    {
      artist:'Rezz', album:'Mass Manipulation', year:2018, genre:'Techno / Electronic', tracks:9,
      image:'images/album-rezz-massmanipulation.jpg',
      artistDesc:'Ukrainian DJ and record producer',
      artistBio:'Isabelle Rezazadeh, known as Rezz, is a Ukrainian-Canadian DJ and record producer from Niagara Falls, Ontario.',
      rating:4.1, reviewCount:14000,
      reviews:[
        rv(5,4,'puts you in a trance immediately. perfect headphone album'),
        rv(3,4,'dark and hypnotic, she is genuinely unmatched in this space'),
        rv(6,3.5,"not always what i'm in the mood for but when i am it GOES"),
      ]
    },
    {
      artist:'Freddie Gibbs & The Alchemist', album:'Alfredo', year:2020, genre:'Hip-hop', tracks:10,
      image:'images/album-freddiegibbs-alfredo.jpg',
      artistDesc:'American rapper and record producer collaboration',
      artistBio:'Freddie Gibbs is an American rapper from Gary, Indiana, known for his precise delivery and gangster rap style.',
      rating:4.5, reviewCount:18000,
      reviews:[
        rv(0,4.5,'the alchemist brings out a different side of freddie'),
        rv(1,4.5,'skinny suge is a perfect song'),
        rv(6,4,'surprisingly mellow for gibbs, works beautifully'),
      ]
    },
    {
      artist:'100 gecs', album:'10000 gecs', year:2023, genre:'Hyperpop / Pop-punk', tracks:13,
      image:'images/album-100gecs-10000gecs.jpg',
      artistDesc:'American musical duo',
      artistBio:'100 Gecs is an American musical duo formed in 2015 that consists of Dylan Brady and Laura Les.',
      rating:3.8, reviewCount:28000,
      reviews:[
        rv(4,3.5,'lost a lot of the chaos that made the first one special'),
        rv(5,3.5,'good but not as revolutionary as the debut'),
        rv(3,4,'the collab tracks still bang though'),
      ]
    },
    {
      artist:'100 gecs', album:'1000 gecs', year:2019, genre:'Hyperpop', tracks:10,
      image:'images/album-100gecs-1000gecs.jpg',
      artistDesc:'American musical duo',
      artistBio:'100 Gecs is an American musical duo formed in 2015 that consists of Dylan Brady and Laura Les.',
      rating:4.1, reviewCount:45200,
      reviews:[
        rv(0,4,'this rewired my brain. nothing sounds like this and probably nothing ever will'),
        rv(1,4.5,'chaotic in the best way, every track is an event unto itself'),
        rv(2,4,'honestly i hated it then loved it then hated it. still love it'),
      ]
    },
    {
      artist:'Crystal Castles', album:'(II)', year:2010, genre:'Electronic / Industrial', tracks:14,
      image:'images/album-crystalcastles1.png',
      artistDesc:'Canadian electronic music group',
      artistBio:'Crystal Castles are a Canadian electronic music group formed in Toronto in 2004.',
      rating:4.4, reviewCount:19000,
      reviews:[
        rv(0,4.5,'celestica is one of the most beautiful songs in electronic music'),
        rv(1,4.5,'alice glass just sounds like no one else, this album is proof'),
        rv(2,4,'chaotic and beautiful in equal measure'),
      ]
    },
    {
      artist:'Trippie Redd', album:'genre : sadboy', year:2024, genre:'Hip-hop', tracks:10,
      image:'images/album-trippieredd-genresadboy.jpg',
      artistDesc:'American rapper and singer',
      artistBio:'Trippie Redd is an American rapper and singer from Canton, Ohio, known for blending melodic trap with emo and rock.',
      rating:4.7, reviewCount:23000,
      reviews:[
        rv(4,5,'bold, weird, and completely their own thing. love it'),
        rv(6,4.5,'the production alone is worth the price of admission'),
        rv(6,4,'every element is placed with intention. a real headphone album'),
      ]
    },
    {
      artist:'Trippie Redd', album:'LIFE\'S A TRIP', year:2018, genre:'Hip-hop', tracks:14,
      image:'images/album-trippieredd-lifesatrip.jpg',
      artistDesc:'American rapper and singer',
      artistBio:'Trippie Redd is an American rapper and singer from Canton, Ohio, known for blending melodic trap with emo and rock.',
      rating:4.3, reviewCount:63000,
      reviews:[
        rv(5,4.5,'bold, weird, and completely their own thing. love it'),
        rv(3,4,'the production alone is worth the price of admission'),
        rv(4,4,'warm and immediate but deep enough to sit with for weeks'),
      ]
    },
    {
      artist:'Trippie Redd', album:'Trip At Knight', year:2021, genre:'Hip-hop', tracks:18,
      image:'images/album-trippieredd-tripatknight.jpg',
      artistDesc:'American rapper and singer',
      artistBio:'Trippie Redd is an American rapper and singer from Canton, Ohio, known for blending melodic trap with emo and rock.',
      rating:4.4, reviewCount:8000,
      reviews:[
        rv(2,5,'the atmosphere on this is unmatched. pure mood'),
        rv(5,4.5,'an immaculate run of songs. the sequencing is perfect'),
        rv(2,4,'warm and immediate but deep enough to sit with for weeks'),
      ]
    },
    {
      artist:'Justice', album:'Justice', year:2007, genre:'Electronic', tracks:12,
      image:'images/album-justice-justice.jpg',
      artistDesc:'French electronic duo',
      artistBio:'Justice are a French electronic music duo of Gaspard Augé and Xavier de Rosnay, pillars of the Ed Banger label.',
      rating:4.6, reviewCount:41000,
      reviews:[
        rv(4,5,'the kind of record that makes you text a friend at 2am'),
        rv(3,4.5,'gorgeous songwriting, no filler, endlessly rewarding'),
        rv(5,4,'still finding new details months later. what a record'),
      ]
    },
    {
      artist:'Justice', album:'Hyperdrama', year:2024, genre:'Electronic', tracks:13,
      image:'images/album-justice-hyperdrama.jpg',
      artistDesc:'French electronic duo',
      artistBio:'Justice are a French electronic music duo of Gaspard Augé and Xavier de Rosnay, pillars of the Ed Banger label.',
      rating:3.9, reviewCount:16000,
      reviews:[
        rv(1,4.5,'an immaculate run of songs. the sequencing is perfect'),
        rv(3,4,'the production alone is worth the price of admission'),
        rv(2,4,'warm and immediate but deep enough to sit with for weeks'),
      ]
    },
    {
      artist:'Justice', album:'Woman Worldwide', year:2018, genre:'Electronic', tracks:15,
      image:'images/album-justice-womanworldwide.jpg',
      artistDesc:'French electronic duo',
      artistBio:'Justice are a French electronic music duo of Gaspard Augé and Xavier de Rosnay, pillars of the Ed Banger label.',
      rating:4.3, reviewCount:29000,
      reviews:[
        rv(1,4.5,'this album lives in my head rent free. the replay value is unreal'),
        rv(6,4,'confident, cohesive, and impossible to shake'),
        rv(1,4,'hits a nerve you didn\'t know you had. stunning front to back'),
      ]
    },
    {
      artist:'Men I Trust', album:'Equus Caballus', year:2025, genre:'Alternative', tracks:13,
      image:'images/album-menitrust-equuscaballus.jpg',
      artistDesc:'Canadian indie band',
      artistBio:'Men I Trust is a Canadian indie band from Quebec City known for its hazy, minimalist dream-pop.',
      rating:4.3, reviewCount:26000,
      reviews:[
        rv(1,4.5,'this album lives in my head rent free. the replay value is unreal'),
        rv(2,4,'criminally slept on. deserves way more attention than it got'),
        rv(3,4,'the kind of record that makes you text a friend at 2am'),
      ]
    },
    {
      artist:'Men I Trust', album:'Oncle Jazz', year:2019, genre:'Pop', tracks:24,
      image:'images/album-menitrust-onclejazz.jpg',
      artistDesc:'Canadian indie band',
      artistBio:'Men I Trust is a Canadian indie band from Quebec City known for its hazy, minimalist dream-pop.',
      rating:4.6, reviewCount:82000,
      reviews:[
        rv(2,5,'took a couple listens to click and then i couldn\'t stop'),
        rv(5,4.5,'criminally slept on. deserves way more attention than it got'),
        rv(5,4,'one of the most complete projects in their catalog. not a wasted moment'),
      ]
    },
    {
      artist:'Leessang', album:'AsuRaBalBalTa', year:2011, genre:'Asian Music', tracks:13,
      image:'images/album-leessang-asurabalbalta.jpg',
      artistDesc:'South Korean hip-hop duo',
      artistBio:'Leessang were a South Korean hip-hop duo composed of Gary and Gil, celebrated for soulful, lyrical rap.',
      rating:3.9, reviewCount:24000,
      reviews:[
        rv(6,4.5,'textured, patient, and quietly devastating. grows with every listen'),
        rv(5,4,'criminally slept on. deserves way more attention than it got'),
        rv(2,4,'warm and immediate but deep enough to sit with for weeks'),
      ]
    },
    {
      artist:'Leessang', album:'Leessang Of Honey Familly', year:2002, genre:'Hip-hop', tracks:16,
      image:'images/album-leessang-leessangofhoneyfamilly.jpg',
      artistDesc:'South Korean hip-hop duo',
      artistBio:'Leessang were a South Korean hip-hop duo composed of Gary and Gil, celebrated for soulful, lyrical rap.',
      rating:4.3, reviewCount:57000,
      reviews:[
        rv(5,4.5,'bold, weird, and completely their own thing. love it'),
        rv(1,4,'warm and immediate but deep enough to sit with for weeks'),
        rv(1,4,'every element is placed with intention. a real headphone album'),
      ]
    },
    {
      artist:'Leessang', album:'Leessang 3 - Library Of Soul', year:2005, genre:'Asian Music', tracks:13,
      image:'images/album-leessang-leessang3libraryofsoul.jpg',
      artistDesc:'South Korean hip-hop duo',
      artistBio:'Leessang were a South Korean hip-hop duo composed of Gary and Gil, celebrated for soulful, lyrical rap.',
      rating:4.8, reviewCount:26000,
      reviews:[
        rv(0,5,'bold, weird, and completely their own thing. love it'),
        rv(3,4.5,'every element is placed with intention. a real headphone album'),
        rv(3,4,'the atmosphere on this is unmatched. pure mood'),
      ]
    },
    {
      artist:'Freestylers', album:'We Rock Hard', year:2016, genre:'Electronic', tracks:15,
      image:'images/album-freestylers-werockhard.jpg',
      artistDesc:'British big beat group',
      artistBio:'Freestylers are a British big beat and breakbeat group formed in London in the mid-1990s.',
      rating:4.3, reviewCount:22000,
      reviews:[
        rv(5,4.5,'criminally slept on. deserves way more attention than it got'),
        rv(4,4,'warm and immediate but deep enough to sit with for weeks'),
        rv(2,4,'textured, patient, and quietly devastating. grows with every listen'),
      ]
    },
    {
      artist:'Freestylers', album:'Raw As F**k', year:2012, genre:'Electronic', tracks:13,
      image:'images/album-freestylers-rawasfk.jpg',
      artistDesc:'British big beat group',
      artistBio:'Freestylers are a British big beat and breakbeat group formed in London in the mid-1990s.',
      rating:3.8, reviewCount:40000,
      reviews:[
        rv(6,4.5,'still finding new details months later. what a record'),
        rv(0,4,'the kind of record that makes you text a friend at 2am'),
        rv(2,4,'every element is placed with intention. a real headphone album'),
      ]
    },
    {
      artist:'Freestylers', album:'Adventures In Freestyle', year:2006, genre:'Electronic', tracks:15,
      image:'images/album-freestylers-adventuresinfreestyle.jpg',
      artistDesc:'British big beat group',
      artistBio:'Freestylers are a British big beat and breakbeat group formed in London in the mid-1990s.',
      rating:3.9, reviewCount:5000,
      reviews:[
        rv(3,4.5,'a grower that became an all-timer for me'),
        rv(4,4,'bold, weird, and completely their own thing. love it'),
        rv(3,4,'they never miss and this is proof. instant favorite'),
      ]
    },
    {
      artist:'Cake Pop', album:'Cake Pop 2', year:2021, genre:'Electronic', tracks:10,
      image:'images/album-cakepop-cakepop2.jpg',
      artistDesc:'American hyperpop collective',
      artistBio:'Cake Pop is an American hyperpop supergroup assembled around producer Dylan Brady.',
      rating:4.4, reviewCount:15000,
      reviews:[
        rv(5,5,'criminally slept on. deserves way more attention than it got'),
        rv(4,4.5,'warm and immediate but deep enough to sit with for weeks'),
        rv(5,4,'this is the one i put on when nothing else feels right'),
      ]
    },
    {
      artist:'Kanye West', album:'Graduation', year:2007, genre:'Hip-hop', tracks:14,
      image:'images/album-kanyewest-graduation.jpg',
      artistDesc:'American rapper and producer',
      artistBio:'Kanye West is an American rapper, producer, and designer from Chicago, one of the most influential figures in modern music.',
      rating:4.7, reviewCount:29000,
      reviews:[
        rv(5,5,'criminally slept on. deserves way more attention than it got'),
        rv(4,4.5,'textured, patient, and quietly devastating. grows with every listen'),
        rv(1,4,'hits a nerve you didn\'t know you had. stunning front to back'),
      ]
    },
    {
      artist:'Kanye West', album:'The College Dropout', year:2004, genre:'Hip-hop', tracks:21,
      image:'images/album-kanyewest-thecollegedropout.jpg',
      artistDesc:'American rapper and producer',
      artistBio:'Kanye West is an American rapper, producer, and designer from Chicago, one of the most influential figures in modern music.',
      rating:4.5, reviewCount:18000,
      reviews:[
        rv(4,5,'a grower that became an all-timer for me'),
        rv(3,4.5,'textured, patient, and quietly devastating. grows with every listen'),
        rv(6,4,'hits a nerve you didn\'t know you had. stunning front to back'),
      ]
    },
    {
      artist:'Kanye West', album:'My Beautiful Dark Twisted Fantasy', year:2010, genre:'Hip-hop', tracks:13,
      image:'images/album-kanyewest-mybeautifuldarktwisted.jpg',
      artistDesc:'American rapper and producer',
      artistBio:'Kanye West is an American rapper, producer, and designer from Chicago, one of the most influential figures in modern music.',
      rating:4.8, reviewCount:25000,
      reviews:[
        rv(6,5,'confident, cohesive, and impossible to shake'),
        rv(5,4.5,'this is the one i put on when nothing else feels right'),
        rv(3,4,'textured, patient, and quietly devastating. grows with every listen'),
      ]
    },
    {
      artist:'100 gecs', album:'1000 gecs and The Tree of Clues', year:2020, genre:'Alternative', tracks:19,
      image:'images/album-100gecs-1000gecsandthetreeofcl.jpg',
      artistDesc:'American hyperpop duo',
      artistBio:'100 gecs is an American hyperpop duo of Dylan Brady and Laura Les, pioneers of the genre\'s maximalist chaos.',
      rating:4.7, reviewCount:66000,
      reviews:[
        rv(6,5,'took a couple listens to click and then i couldn\'t stop'),
        rv(2,4.5,'the atmosphere on this is unmatched. pure mood'),
        rv(5,4,'this is the one i put on when nothing else feels right'),
      ]
    },
    {
      artist:'Tim Presley', album:'The Wink', year:2016, genre:'Rock', tracks:12,
      image:'images/album-timpresley-thewink.jpg',
      artistDesc:'American musician',
      artistBio:'Tim Presley is an American musician known for his garage-psych project White Fence and his collaboration DRINKS.',
      rating:4.5, reviewCount:86000,
      reviews:[
        rv(6,5,'took a couple listens to click and then i couldn\'t stop'),
        rv(4,4.5,'this is the one i put on when nothing else feels right'),
        rv(6,4,'hits a nerve you didn\'t know you had. stunning front to back'),
      ]
    },
    {
      artist:'Tim Presley', album:'Must Let Go', year:2020, genre:'Alternative', tracks:1,
      image:'images/album-timpresley-mustletgo.jpg',
      artistDesc:'American musician',
      artistBio:'Tim Presley is an American musician known for his garage-psych project White Fence and his collaboration DRINKS.',
      rating:4.8, reviewCount:43000,
      reviews:[
        rv(5,5,'still finding new details months later. what a record'),
        rv(0,4.5,'this is the one i put on when nothing else feels right'),
        rv(6,4,'the kind of record that makes you text a friend at 2am'),
      ]
    },
    {
      artist:'death\'s dynamic shroud', album:'Darklife', year:2022, genre:'Electronic', tracks:15,
      image:'images/album-deathsdynamicshroud-darklife.jpg',
      artistDesc:'American electronic trio',
      artistBio:'death\'s dynamic shroud is an American experimental electronic trio rooted in vaporwave and plunderphonics.',
      rating:4.8, reviewCount:12000,
      reviews:[
        rv(4,5,'hits a nerve you didn\'t know you had. stunning front to back'),
        rv(1,4.5,'one of the most complete projects in their catalog. not a wasted moment'),
        rv(4,4,'confident, cohesive, and impossible to shake'),
      ]
    },
    {
      artist:'death\'s dynamic shroud', album:'I\'ll Try Living Like This', year:2015, genre:'Electronic', tracks:12,
      image:'images/album-deathsdynamicshroud-illtrylivinglikethis.jpg',
      artistDesc:'American electronic trio',
      artistBio:'death\'s dynamic shroud is an American experimental electronic trio rooted in vaporwave and plunderphonics.',
      rating:4.8, reviewCount:63000,
      reviews:[
        rv(2,5,'this album lives in my head rent free. the replay value is unreal'),
        rv(5,4.5,'still finding new details months later. what a record'),
        rv(4,4,'they never miss and this is proof. instant favorite'),
      ]
    },
    {
      artist:'death\'s dynamic shroud', album:'Faith In Persona', year:2022, genre:'Electronic', tracks:9,
      image:'images/album-deathsdynamicshroud-faithinpersona.jpg',
      artistDesc:'American electronic trio',
      artistBio:'death\'s dynamic shroud is an American experimental electronic trio rooted in vaporwave and plunderphonics.',
      rating:4.2, reviewCount:21000,
      reviews:[
        rv(6,4.5,'one of the most complete projects in their catalog. not a wasted moment'),
        rv(4,4,'took a couple listens to click and then i couldn\'t stop'),
        rv(2,4,'a grower that became an all-timer for me'),
      ]
    },
    {
      artist:'$uicideboy$', album:'THY KINGDOM COME', year:2025, genre:'Hip-hop', tracks:10,
      image:'images/album-uicideboy-thykingdomcome.jpg',
      artistDesc:'American hip-hop duo',
      artistBio:'$uicideboy$ are an American hip-hop duo from New Orleans, cousins Ruby da Cherry and $crim, known for dark, lo-fi trap.',
      rating:3.8, reviewCount:31000,
      reviews:[
        rv(4,4.5,'warm and immediate but deep enough to sit with for weeks'),
        rv(4,4,'took a couple listens to click and then i couldn\'t stop'),
        rv(6,4,'the atmosphere on this is unmatched. pure mood'),
      ]
    },
    {
      artist:'$uicideboy$', album:'THY WILL BE DONE', year:2025, genre:'Hip-hop', tracks:10,
      image:'images/album-uicideboy-thywillbedone.jpg',
      artistDesc:'American hip-hop duo',
      artistBio:'$uicideboy$ are an American hip-hop duo from New Orleans, cousins Ruby da Cherry and $crim, known for dark, lo-fi trap.',
      rating:4.7, reviewCount:69000,
      reviews:[
        rv(5,5,'the production alone is worth the price of admission'),
        rv(6,4.5,'criminally slept on. deserves way more attention than it got'),
        rv(3,4,'the atmosphere on this is unmatched. pure mood'),
      ]
    },
    {
      artist:'$uicideboy$', album:'Sing Me a Lullaby, My Sweet Temptation', year:2022, genre:'Hip-hop', tracks:13,
      image:'images/album-uicideboy-singmealullabymysweett.jpg',
      artistDesc:'American hip-hop duo',
      artistBio:'$uicideboy$ are an American hip-hop duo from New Orleans, cousins Ruby da Cherry and $crim, known for dark, lo-fi trap.',
      rating:4.8, reviewCount:45000,
      reviews:[
        rv(4,5,'the kind of record that makes you text a friend at 2am'),
        rv(4,4.5,'textured, patient, and quietly devastating. grows with every listen'),
        rv(2,4,'the atmosphere on this is unmatched. pure mood'),
      ]
    },
    {
      artist:'Bugseed', album:'Bohemian Beatnik', year:2010, genre:'Hip-hop', tracks:15,
      image:'images/album-bugseed-bohemianbeatnik.jpg',
      artistDesc:'Japanese beatmaker',
      artistBio:'Bugseed is a Japanese lo-fi hip-hop producer and beatmaker known for warm, sample-driven instrumentals.',
      rating:4.6, reviewCount:76000,
      reviews:[
        rv(4,5,'an immaculate run of songs. the sequencing is perfect'),
        rv(4,4.5,'the production alone is worth the price of admission'),
        rv(2,4,'criminally slept on. deserves way more attention than it got'),
      ]
    },
    {
      artist:'Bugseed', album:'Soundcraft', year:2014, genre:'Hip-hop', tracks:18,
      image:'images/album-bugseed-soundcraft.jpg',
      artistDesc:'Japanese beatmaker',
      artistBio:'Bugseed is a Japanese lo-fi hip-hop producer and beatmaker known for warm, sample-driven instrumentals.',
      rating:3.9, reviewCount:49000,
      reviews:[
        rv(0,4.5,'an immaculate run of songs. the sequencing is perfect'),
        rv(1,4,'textured, patient, and quietly devastating. grows with every listen'),
        rv(2,4,'took a couple listens to click and then i couldn\'t stop'),
      ]
    },
    {
      artist:'Bugseed', album:'Fresh Jive', year:2018, genre:'Hip-hop', tracks:8,
      image:'images/album-bugseed-freshjive.jpg',
      artistDesc:'Japanese beatmaker',
      artistBio:'Bugseed is a Japanese lo-fi hip-hop producer and beatmaker known for warm, sample-driven instrumentals.',
      rating:4.6, reviewCount:52000,
      reviews:[
        rv(3,5,'warm and immediate but deep enough to sit with for weeks'),
        rv(3,4.5,'emotionally intelligent and sonically fearless'),
        rv(2,4,'an immaculate run of songs. the sequencing is perfect'),
      ]
    },
    {
      artist:'CoryaYo', album:'Ra', year:2018, genre:'Hip-hop', tracks:13,
      image:'images/album-coryayo-ra.jpg',
      artistDesc:'Hip-hop artist and producer',
      artistBio:'CoryaYo is a hip-hop artist and producer working in a soulful, beat-driven style.',
      rating:4.2, reviewCount:28000,
      reviews:[
        rv(0,4.5,'every element is placed with intention. a real headphone album'),
        rv(2,4,'they never miss and this is proof. instant favorite'),
        rv(5,4,'confident, cohesive, and impossible to shake'),
      ]
    },
    {
      artist:'CoryaYo', album:'Waves', year:2015, genre:'Hip-hop', tracks:22,
      image:'images/album-coryayo-waves.jpg',
      artistDesc:'Hip-hop artist and producer',
      artistBio:'CoryaYo is a hip-hop artist and producer working in a soulful, beat-driven style.',
      rating:3.9, reviewCount:21000,
      reviews:[
        rv(6,4.5,'criminally slept on. deserves way more attention than it got'),
        rv(4,4,'they never miss and this is proof. instant favorite'),
        rv(1,4,'textured, patient, and quietly devastating. grows with every listen'),
      ]
    },
    {
      artist:'CoryaYo', album:'Late Bloom', year:2019, genre:'Hip-hop', tracks:13,
      image:'images/album-coryayo-latebloom.jpg',
      artistDesc:'Hip-hop artist and producer',
      artistBio:'CoryaYo is a hip-hop artist and producer working in a soulful, beat-driven style.',
      rating:4.1, reviewCount:71000,
      reviews:[
        rv(4,4.5,'this album lives in my head rent free. the replay value is unreal'),
        rv(1,4,'textured, patient, and quietly devastating. grows with every listen'),
        rv(2,4,'criminally slept on. deserves way more attention than it got'),
      ]
    },
    {
      artist:'J.Rawls', album:'Essence of Soul', year:2005, genre:'Hip-hop', tracks:12,
      image:'images/album-jrawls-essenceofsoul.jpg',
      artistDesc:'American hip-hop producer',
      artistBio:'J.Rawls is an American hip-hop producer from Ohio, a co-founder of Lone Catalysts and a fixture of underground soul-rap.',
      rating:4.8, reviewCount:57000,
      reviews:[
        rv(0,5,'every element is placed with intention. a real headphone album'),
        rv(5,4.5,'warm and immediate but deep enough to sit with for weeks'),
        rv(0,4,'hits a nerve you didn\'t know you had. stunning front to back'),
      ]
    },
    {
      artist:'J.Rawls', album:'Hotel Beats, Vol. 1', year:2017, genre:'Hip-hop', tracks:21,
      image:'images/album-jrawls-hotelbeatsvol1.jpg',
      artistDesc:'American hip-hop producer',
      artistBio:'J.Rawls is an American hip-hop producer from Ohio, a co-founder of Lone Catalysts and a fixture of underground soul-rap.',
      rating:4.6, reviewCount:45000,
      reviews:[
        rv(1,5,'an immaculate run of songs. the sequencing is perfect'),
        rv(2,4.5,'warm and immediate but deep enough to sit with for weeks'),
        rv(4,4,'textured, patient, and quietly devastating. grows with every listen'),
      ]
    },
    {
      artist:'J.Rawls', album:'Hotel Beats, Vol. 2', year:2017, genre:'Hip-hop', tracks:23,
      image:'images/album-jrawls-hotelbeatsvol2.jpg',
      artistDesc:'American hip-hop producer',
      artistBio:'J.Rawls is an American hip-hop producer from Ohio, a co-founder of Lone Catalysts and a fixture of underground soul-rap.',
      rating:3.8, reviewCount:43000,
      reviews:[
        rv(5,4.5,'took a couple listens to click and then i couldn\'t stop'),
        rv(0,4,'emotionally intelligent and sonically fearless'),
        rv(5,4,'the atmosphere on this is unmatched. pure mood'),
      ]
    },
    {
      artist:'Pigeondust', album:'Moon, Wisdom & Slackness', year:2015, genre:'Electronic', tracks:17,
      image:'images/album-pigeondust-moonwisdomslackness.jpg',
      artistDesc:'Japanese beatmaker',
      artistBio:'Pigeondust is a Japanese producer known for dusty, boom-bap-tinged lo-fi hip-hop.',
      rating:4.8, reviewCount:73000,
      reviews:[
        rv(0,5,'every element is placed with intention. a real headphone album'),
        rv(0,4.5,'this is the one i put on when nothing else feels right'),
        rv(6,4,'took a couple listens to click and then i couldn\'t stop'),
      ]
    },
    {
      artist:'Pigeondust', album:'Way Back When', year:2020, genre:'Hip-hop', tracks:36,
      image:'images/album-pigeondust-waybackwhen.jpg',
      artistDesc:'Japanese beatmaker',
      artistBio:'Pigeondust is a Japanese producer known for dusty, boom-bap-tinged lo-fi hip-hop.',
      rating:3.9, reviewCount:64000,
      reviews:[
        rv(5,4.5,'an immaculate run of songs. the sequencing is perfect'),
        rv(3,4,'textured, patient, and quietly devastating. grows with every listen'),
        rv(1,4,'they never miss and this is proof. instant favorite'),
      ]
    },
    {
      artist:'Pigeondust', album:'Chillhop Timezones Japan', year:2025, genre:'Alternative', tracks:20,
      image:'images/album-pigeondust-chillhoptimezonesjapan.jpg',
      artistDesc:'Japanese beatmaker',
      artistBio:'Pigeondust is a Japanese producer known for dusty, boom-bap-tinged lo-fi hip-hop.',
      rating:4.6, reviewCount:56000,
      reviews:[
        rv(3,5,'the production alone is worth the price of admission'),
        rv(4,4.5,'took a couple listens to click and then i couldn\'t stop'),
        rv(4,4,'warm and immediate but deep enough to sit with for weeks'),
      ]
    },
    {
      artist:'Shiro Sagisu', album:'NEON GENESIS EVANGELION (Original Series Soundtrack)', year:2019, genre:'Soundtrack', tracks:22,
      image:'images/album-shirosagisu-neongenesisevangelion.jpg',
      artistDesc:'Japanese composer',
      artistBio:'Shiro Sagisu is a Japanese composer best known for his scores for Neon Genesis Evangelion and Bleach.',
      rating:4.1, reviewCount:55000,
      reviews:[
        rv(6,4.5,'an immaculate run of songs. the sequencing is perfect'),
        rv(5,4,'they never miss and this is proof. instant favorite'),
        rv(1,4,'one of the most complete projects in their catalog. not a wasted moment'),
      ]
    },
    {
      artist:'Shiro Sagisu', album:'TV Animation BLEACH Original Soundtrack 3', year:2008, genre:'Soundtrack', tracks:27,
      image:'images/album-shirosagisu-tvanimationbleachorigi.jpg',
      artistDesc:'Japanese composer',
      artistBio:'Shiro Sagisu is a Japanese composer best known for his scores for Neon Genesis Evangelion and Bleach.',
      rating:4.0, reviewCount:42000,
      reviews:[
        rv(3,4.5,'warm and immediate but deep enough to sit with for weeks'),
        rv(3,4,'one of the most complete projects in their catalog. not a wasted moment'),
        rv(0,4,'still finding new details months later. what a record'),
      ]
    },
    {
      artist:'Shiro Sagisu', album:'TV Animation BLEACH Original Soundtrack 1', year:2005, genre:'Soundtrack', tracks:25,
      image:'images/album-shirosagisu-tvanimationbleachorigi.jpg',
      artistDesc:'Japanese composer',
      artistBio:'Shiro Sagisu is a Japanese composer best known for his scores for Neon Genesis Evangelion and Bleach.',
      rating:3.8, reviewCount:71000,
      reviews:[
        rv(6,4.5,'warm and immediate but deep enough to sit with for weeks'),
        rv(4,4,'they never miss and this is proof. instant favorite'),
        rv(1,4,'the atmosphere on this is unmatched. pure mood'),
      ]
    },
    {
      artist:'Jan Panenka', album:'Mozart: Quintet in E-Flat Major - Beethoven: Sextet in E-Flat Major', year:2023, genre:'Classical', tracks:7,
      image:'images/album-janpanenka-mozartquintetineflatma.jpg',
      artistDesc:'Czech classical pianist',
      artistBio:'Jan Panenka was a Czech classical pianist (1922-1999) renowned for his interpretations of Beethoven and chamber repertoire.',
      rating:4.3, reviewCount:77000,
      reviews:[
        rv(5,4.5,'emotionally intelligent and sonically fearless'),
        rv(4,4,'a grower that became an all-timer for me'),
        rv(3,4,'the kind of record that makes you text a friend at 2am'),
      ]
    },
    {
      artist:'Jan Panenka', album:'Beethoven, Concierto para Piano No. 1 y Concierto para Piano No. 2', year:2025, genre:'Classical', tracks:6,
      image:'images/album-janpanenka-beethovenconciertopara.jpg',
      artistDesc:'Czech classical pianist',
      artistBio:'Jan Panenka was a Czech classical pianist (1922-1999) renowned for his interpretations of Beethoven and chamber repertoire.',
      rating:4.4, reviewCount:35000,
      reviews:[
        rv(2,5,'confident, cohesive, and impossible to shake'),
        rv(6,4.5,'a grower that became an all-timer for me'),
        rv(5,4,'they never miss and this is proof. instant favorite'),
      ]
    },
    {
      artist:'Jan Panenka', album:'Bořkovec, Podešva: Sonatas for Violin and Piano', year:2024, genre:'Classical', tracks:8,
      image:'images/album-janpanenka-bokovecpodevasonatasfo.jpg',
      artistDesc:'Czech classical pianist',
      artistBio:'Jan Panenka was a Czech classical pianist (1922-1999) renowned for his interpretations of Beethoven and chamber repertoire.',
      rating:3.9, reviewCount:22000,
      reviews:[
        rv(6,4.5,'bold, weird, and completely their own thing. love it'),
        rv(3,4,'this album lives in my head rent free. the replay value is unreal'),
        rv(6,4,'an immaculate run of songs. the sequencing is perfect'),
      ]
    },
    {
      artist:'BAYNK', album:'ADOLESCENCE', year:2022, genre:'Electronic', tracks:10,
      image:'images/album-baynk-adolescence.jpg',
      artistDesc:'New Zealand electronic producer',
      artistBio:'BAYNK is a New Zealand electronic producer and singer crafting sleek, dance-leaning alt-pop.',
      rating:4.7, reviewCount:11000,
      reviews:[
        rv(4,5,'textured, patient, and quietly devastating. grows with every listen'),
        rv(5,4.5,'this is the one i put on when nothing else feels right'),
        rv(1,4,'criminally slept on. deserves way more attention than it got'),
      ]
    },
    {
      artist:'BAYNK', album:'SENESCENCE', year:2024, genre:'Electronic', tracks:10,
      image:'images/album-baynk-senescence.jpg',
      artistDesc:'New Zealand electronic producer',
      artistBio:'BAYNK is a New Zealand electronic producer and singer crafting sleek, dance-leaning alt-pop.',
      rating:4.3, reviewCount:47000,
      reviews:[
        rv(1,4.5,'warm and immediate but deep enough to sit with for weeks'),
        rv(5,4,'gorgeous songwriting, no filler, endlessly rewarding'),
        rv(5,4,'took a couple listens to click and then i couldn\'t stop'),
      ]
    },
    {
      artist:'BAYNK', album:'Someone\'s EP II', year:2019, genre:'Electronic', tracks:7,
      image:'images/album-baynk-someonesepii.jpg',
      artistDesc:'New Zealand electronic producer',
      artistBio:'BAYNK is a New Zealand electronic producer and singer crafting sleek, dance-leaning alt-pop.',
      rating:4.0, reviewCount:43000,
      reviews:[
        rv(0,4.5,'this album lives in my head rent free. the replay value is unreal'),
        rv(1,4,'the kind of record that makes you text a friend at 2am'),
        rv(1,4,'took a couple listens to click and then i couldn\'t stop'),
      ]
    },
    {
      artist:'Vance Joy', album:'Dream Your Life Away', year:2014, genre:'Alternative', tracks:13,
      image:'images/album-vancejoy-dreamyourlifeaway.jpg',
      artistDesc:'Australian singer-songwriter',
      artistBio:'Vance Joy is an Australian singer-songwriter from Melbourne known for warm, folk-pop songwriting.',
      rating:4.1, reviewCount:15000,
      reviews:[
        rv(4,4.5,'this album lives in my head rent free. the replay value is unreal'),
        rv(0,4,'the kind of record that makes you text a friend at 2am'),
        rv(6,4,'they never miss and this is proof. instant favorite'),
      ]
    },
    {
      artist:'Vance Joy', album:'Nation of Two', year:2018, genre:'Alternative', tracks:13,
      image:'images/album-vancejoy-nationoftwo.jpg',
      artistDesc:'Australian singer-songwriter',
      artistBio:'Vance Joy is an Australian singer-songwriter from Melbourne known for warm, folk-pop songwriting.',
      rating:4.3, reviewCount:28000,
      reviews:[
        rv(2,4.5,'every element is placed with intention. a real headphone album'),
        rv(3,4,'confident, cohesive, and impossible to shake'),
        rv(6,4,'the production alone is worth the price of admission'),
      ]
    },
    {
      artist:'Vance Joy', album:'In Our Own Sweet Time', year:2022, genre:'Alternative', tracks:12,
      image:'images/album-vancejoy-inourownsweettime.jpg',
      artistDesc:'Australian singer-songwriter',
      artistBio:'Vance Joy is an Australian singer-songwriter from Melbourne known for warm, folk-pop songwriting.',
      rating:4.2, reviewCount:22000,
      reviews:[
        rv(6,4.5,'this is the one i put on when nothing else feels right'),
        rv(6,4,'textured, patient, and quietly devastating. grows with every listen'),
        rv(2,4,'the atmosphere on this is unmatched. pure mood'),
      ]
    },
    {
      artist:'A. G. Cook', album:'Soft Rock', year:2023, genre:'Electronic', tracks:12,
      image:'images/album-agcook-softrock.jpg',
      artistDesc:'British producer',
      artistBio:'A. G. Cook is a British producer and the founder of PC Music, a central architect of hyperpop.',
      rating:4.1, reviewCount:12000,
      reviews:[
        rv(3,4.5,'took a couple listens to click and then i couldn\'t stop'),
        rv(1,4,'hits a nerve you didn\'t know you had. stunning front to back'),
        rv(0,4,'gorgeous songwriting, no filler, endlessly rewarding'),
      ]
    },
    {
      artist:'A. G. Cook', album:'Britpop', year:2024, genre:'Pop', tracks:24,
      image:'images/album-agcook-britpop.jpg',
      artistDesc:'British producer',
      artistBio:'A. G. Cook is a British producer and the founder of PC Music, a central architect of hyperpop.',
      rating:4.5, reviewCount:82000,
      reviews:[
        rv(3,5,'hits a nerve you didn\'t know you had. stunning front to back'),
        rv(1,4.5,'still finding new details months later. what a record'),
        rv(3,4,'one of the most complete projects in their catalog. not a wasted moment'),
      ]
    },
    {
      artist:'A. G. Cook', album:'7G', year:2020, genre:'Alternative', tracks:49,
      image:'images/album-agcook-7g.jpg',
      artistDesc:'British producer',
      artistBio:'A. G. Cook is a British producer and the founder of PC Music, a central architect of hyperpop.',
      rating:4.2, reviewCount:24000,
      reviews:[
        rv(6,4.5,'emotionally intelligent and sonically fearless'),
        rv(5,4,'one of the most complete projects in their catalog. not a wasted moment'),
        rv(4,4,'criminally slept on. deserves way more attention than it got'),
      ]
    },
    {
      artist:'Dutch Disorder', album:'Heroine', year:2007, genre:'Electronic', tracks:1,
      image:'images/album-dutchdisorder-heroine.jpg',
      artistDesc:'Electronic producer',
      artistBio:'Dutch Disorder is an electronic producer working in club-leaning dance styles.',
      rating:3.8, reviewCount:51000,
      reviews:[
        rv(1,4.5,'this is the one i put on when nothing else feels right'),
        rv(1,4,'emotionally intelligent and sonically fearless'),
        rv(2,4,'the production alone is worth the price of admission'),
      ]
    },
    {
      artist:'DAVICHI', album:'여성시대 / 영원한 사랑', year:2009, genre:'Asian Music', tracks:3,
      image:'images/album-davichi-.jpg',
      artistDesc:'South Korean pop duo',
      artistBio:'Davichi are a South Korean pop duo known for powerhouse ballad vocals.',
      rating:4.0, reviewCount:51000,
      reviews:[
        rv(0,4.5,'a grower that became an all-timer for me'),
        rv(0,4,'they never miss and this is proof. instant favorite'),
        rv(5,4,'still finding new details months later. what a record'),
      ]
    },
    {
      artist:'DAVICHI', album:'Doom at Your Service (Original Television Soundtrack) Pt. 5', year:2021, genre:'Soundtrack', tracks:2,
      image:'images/album-davichi-doomatyourservicept5.jpg',
      artistDesc:'South Korean pop duo',
      artistBio:'Davichi are a South Korean pop duo known for powerhouse ballad vocals.',
      rating:3.8, reviewCount:24000,
      reviews:[
        rv(0,4.5,'the atmosphere on this is unmatched. pure mood'),
        rv(3,4,'the kind of record that makes you text a friend at 2am'),
        rv(1,4,'hits a nerve you didn\'t know you had. stunning front to back'),
      ]
    },
    {
      artist:'DAVICHI', album:'Descendants Of The Sun Pt.3 (Original Television Soundtrack)', year:2016, genre:'Soundtrack', tracks:2,
      image:'images/album-davichi-descendantsofthesunpt3.jpg',
      artistDesc:'South Korean pop duo',
      artistBio:'Davichi are a South Korean pop duo known for powerhouse ballad vocals.',
      rating:4.0, reviewCount:74000,
      reviews:[
        rv(4,4.5,'this is the one i put on when nothing else feels right'),
        rv(0,4,'still finding new details months later. what a record'),
        rv(3,4,'confident, cohesive, and impossible to shake'),
      ]
    },
    {
      artist:'BläZy', album:'Polychrome', year:2025, genre:'Hip-hop', tracks:10,
      image:'images/album-blzy-polychrome.jpg',
      artistDesc:'Electronic artist',
      artistBio:'BläZy is an electronic artist working across atmospheric, club-adjacent styles.',
      rating:4.3, reviewCount:31000,
      reviews:[
        rv(5,4.5,'the atmosphere on this is unmatched. pure mood'),
        rv(0,4,'one of the most complete projects in their catalog. not a wasted moment'),
        rv(1,4,'bold, weird, and completely their own thing. love it'),
      ]
    },
    {
      artist:'Frou Frou', album:'Details', year:2002, genre:'Rock', tracks:11,
      image:'images/album-froufrou-details.jpg',
      artistDesc:'British electronic duo',
      artistBio:'Frou Frou were a British electronic duo of Imogen Heap and Guy Sigsworth, cult favorites of early-2000s art-pop.',
      rating:4.5, reviewCount:12000,
      reviews:[
        rv(0,5,'this is the one i put on when nothing else feels right'),
        rv(0,4.5,'they never miss and this is proof. instant favorite'),
        rv(4,4,'gorgeous songwriting, no filler, endlessly rewarding'),
      ]
    },
    {
      artist:'Frou Frou', album:'Off Cuts', year:2022, genre:'Alternative', tracks:6,
      image:'images/album-froufrou-offcuts.jpg',
      artistDesc:'British electronic duo',
      artistBio:'Frou Frou were a British electronic duo of Imogen Heap and Guy Sigsworth, cult favorites of early-2000s art-pop.',
      rating:3.8, reviewCount:76000,
      reviews:[
        rv(5,4.5,'gorgeous songwriting, no filler, endlessly rewarding'),
        rv(2,4,'the production alone is worth the price of admission'),
        rv(2,4,'warm and immediate but deep enough to sit with for weeks'),
      ]
    },
    {
      artist:'Frou Frou', album:'new kind of FAK', year:2024, genre:'Electronic', tracks:4,
      image:'images/album-froufrou-newkindoffak.jpg',
      artistDesc:'British electronic duo',
      artistBio:'Frou Frou were a British electronic duo of Imogen Heap and Guy Sigsworth, cult favorites of early-2000s art-pop.',
      rating:4.6, reviewCount:83000,
      reviews:[
        rv(6,5,'the kind of record that makes you text a friend at 2am'),
        rv(0,4.5,'one of the most complete projects in their catalog. not a wasted moment'),
        rv(5,4,'a grower that became an all-timer for me'),
      ]
    },
    {
      artist:'Niki Istrefi', album:'EUROMANTIC001', year:2017, genre:'Electronic', tracks:4,
      image:'images/album-nikiistrefi-euromantic001.jpg',
      artistDesc:'Electronic producer',
      artistBio:'Niki Istrefi is an electronic producer and DJ working in hard, percussive club music.',
      rating:4.1, reviewCount:43000,
      reviews:[
        rv(3,4.5,'gorgeous songwriting, no filler, endlessly rewarding'),
        rv(3,4,'warm and immediate but deep enough to sit with for weeks'),
        rv(4,4,'this album lives in my head rent free. the replay value is unreal'),
      ]
    },
    {
      artist:'Niki Istrefi', album:'Confront The Assault (SCX020)', year:2022, genre:'Electronic', tracks:5,
      image:'images/album-nikiistrefi-confronttheassault.jpg',
      artistDesc:'Electronic producer',
      artistBio:'Niki Istrefi is an electronic producer and DJ working in hard, percussive club music.',
      rating:4.5, reviewCount:10000,
      reviews:[
        rv(2,5,'every element is placed with intention. a real headphone album'),
        rv(6,4.5,'a grower that became an all-timer for me'),
        rv(6,4,'one of the most complete projects in their catalog. not a wasted moment'),
      ]
    },
    {
      artist:'Niki Istrefi', album:'Body Changes Are Natural', year:2020, genre:'Electronic', tracks:4,
      image:'images/album-nikiistrefi-bodychangesarenatural.jpg',
      artistDesc:'Electronic producer',
      artistBio:'Niki Istrefi is an electronic producer and DJ working in hard, percussive club music.',
      rating:4.1, reviewCount:18000,
      reviews:[
        rv(4,4.5,'one of the most complete projects in their catalog. not a wasted moment'),
        rv(6,4,'this is the one i put on when nothing else feels right'),
        rv(4,4,'took a couple listens to click and then i couldn\'t stop'),
      ]
    },
    {
      artist:'Megumi Hayashibara', album:'スレイヤーズMEGUMIXXX', year:2020, genre:'Soundtrack', tracks:33,
      image:'images/album-megumihayashibara-megumixxx.jpg',
      artistDesc:'Japanese singer and voice actress',
      artistBio:'Megumi Hayashibara is a Japanese singer and voice actress, one of the most prolific figures in anime music.',
      rating:4.7, reviewCount:79000,
      reviews:[
        rv(1,5,'textured, patient, and quietly devastating. grows with every listen'),
        rv(2,4.5,'took a couple listens to click and then i couldn\'t stop'),
        rv(1,4,'still finding new details months later. what a record'),
      ]
    },
    {
      artist:'Megumi Hayashibara', album:'Fifty～Fifty', year:2018, genre:'Soundtrack', tracks:14,
      image:'images/album-megumihayashibara-fiftyfifty.jpg',
      artistDesc:'Japanese singer and voice actress',
      artistBio:'Megumi Hayashibara is a Japanese singer and voice actress, one of the most prolific figures in anime music.',
      rating:4.1, reviewCount:36000,
      reviews:[
        rv(5,4.5,'this is the one i put on when nothing else feels right'),
        rv(1,4,'textured, patient, and quietly devastating. grows with every listen'),
        rv(4,4,'criminally slept on. deserves way more attention than it got'),
      ]
    },
    {
      artist:'Megumi Hayashibara', album:'Evangelion Finally', year:2020, genre:'Soundtrack', tracks:15,
      image:'images/album-megumihayashibara-evangelionfinally.jpg',
      artistDesc:'Japanese singer and voice actress',
      artistBio:'Megumi Hayashibara is a Japanese singer and voice actress, one of the most prolific figures in anime music.',
      rating:4.1, reviewCount:39000,
      reviews:[
        rv(1,4.5,'this album lives in my head rent free. the replay value is unreal'),
        rv(1,4,'gorgeous songwriting, no filler, endlessly rewarding'),
        rv(4,4,'a grower that became an all-timer for me'),
      ]
    },
    {
      artist:'Yoko Takahashi', album:'Evangelion Finally', year:2020, genre:'Soundtrack', tracks:15,
      image:'images/album-yokotakahashi-evangelionfinally.jpg',
      artistDesc:'Japanese singer',
      artistBio:'Yoko Takahashi is a Japanese singer best known for \'A Cruel Angel\'s Thesis,\' the theme of Neon Genesis Evangelion.',
      rating:4.0, reviewCount:39000,
      reviews:[
        rv(1,4.5,'this album lives in my head rent free. the replay value is unreal'),
        rv(1,4,'gorgeous songwriting, no filler, endlessly rewarding'),
        rv(4,4,'a grower that became an all-timer for me'),
      ]
    },
    {
      artist:'Yoko Takahashi', album:'EVANGELION ETERNALLY', year:2023, genre:'Soundtrack', tracks:8,
      image:'images/album-yokotakahashi-evangelioneternally.jpg',
      artistDesc:'Japanese singer',
      artistBio:'Yoko Takahashi is a Japanese singer best known for \'A Cruel Angel\'s Thesis,\' the theme of Neon Genesis Evangelion.',
      rating:3.9, reviewCount:8000,
      reviews:[
        rv(2,4.5,'the kind of record that makes you text a friend at 2am'),
        rv(4,4,'still finding new details months later. what a record'),
        rv(1,4,'every element is placed with intention. a real headphone album'),
      ]
    },
    {
      artist:'Yoko Takahashi', album:'Soreha Toki ni Anata wo hagemashi, Toki ni Sasae to naru Mono', year:2020, genre:'Soundtrack', tracks:11,
      image:'images/album-yokotakahashi-sorehatokinianatawohag.jpg',
      artistDesc:'Japanese singer',
      artistBio:'Yoko Takahashi is a Japanese singer best known for \'A Cruel Angel\'s Thesis,\' the theme of Neon Genesis Evangelion.',
      rating:3.8, reviewCount:6000,
      reviews:[
        rv(4,4.5,'hits a nerve you didn\'t know you had. stunning front to back'),
        rv(4,4,'bold, weird, and completely their own thing. love it'),
        rv(5,4,'took a couple listens to click and then i couldn\'t stop'),
      ]
    },
    {
      artist:'Florence + The Machine', album:'Between Two Lungs', year:2010, genre:'Alternative', tracks:25,
      image:'images/album-florencethemachine-betweentwolungs.jpg',
      artistDesc:'English indie rock band',
      artistBio:'Florence + the Machine are an English indie rock band led by Florence Welch, known for soaring, baroque art-pop.',
      rating:4.7, reviewCount:89000,
      reviews:[
        rv(1,5,'every element is placed with intention. a real headphone album'),
        rv(5,4.5,'the production alone is worth the price of admission'),
        rv(6,4,'confident, cohesive, and impossible to shake'),
      ]
    },
    {
      artist:'Florence + The Machine', album:'Everybody Scream', year:2025, genre:'Alternative', tracks:12,
      image:'images/album-florencethemachine-everybodyscream.jpg',
      artistDesc:'English indie rock band',
      artistBio:'Florence + the Machine are an English indie rock band led by Florence Welch, known for soaring, baroque art-pop.',
      rating:4.1, reviewCount:67000,
      reviews:[
        rv(3,4.5,'one of the most complete projects in their catalog. not a wasted moment'),
        rv(6,4,'still finding new details months later. what a record'),
        rv(1,4,'confident, cohesive, and impossible to shake'),
      ]
    },
    {
      artist:'Florence + The Machine', album:'How Big, How Blue, How Beautiful (Deluxe)', year:2015, genre:'Alternative', tracks:16,
      image:'images/album-florencethemachine-howbighowbluehowbeauti.jpg',
      artistDesc:'English indie rock band',
      artistBio:'Florence + the Machine are an English indie rock band led by Florence Welch, known for soaring, baroque art-pop.',
      rating:4.4, reviewCount:40000,
      reviews:[
        rv(5,5,'took a couple listens to click and then i couldn\'t stop'),
        rv(4,4.5,'the production alone is worth the price of admission'),
        rv(0,4,'they never miss and this is proof. instant favorite'),
      ]
    },
    {
      artist:'M.I.A.', album:'Kala', year:2007, genre:'Electronic', tracks:12,
      image:'images/album-mia-kala.jpg',
      artistDesc:'British rapper and singer',
      artistBio:'M.I.A. is a British rapper, singer, and producer of Sri Lankan Tamil heritage, known for genre-fusing political pop.',
      rating:4.7, reviewCount:24000,
      reviews:[
        rv(6,5,'the atmosphere on this is unmatched. pure mood'),
        rv(2,4.5,'this is the one i put on when nothing else feels right'),
        rv(5,4,'hits a nerve you didn\'t know you had. stunning front to back'),
      ]
    },
    {
      artist:'M.I.A.', album:'Matangi', year:2018, genre:'Electronic', tracks:16,
      image:'images/album-mia-matangi.jpg',
      artistDesc:'British rapper and singer',
      artistBio:'M.I.A. is a British rapper, singer, and producer of Sri Lankan Tamil heritage, known for genre-fusing political pop.',
      rating:3.8, reviewCount:75000,
      reviews:[
        rv(5,4.5,'they never miss and this is proof. instant favorite'),
        rv(1,4,'still finding new details months later. what a record'),
        rv(0,4,'this is the one i put on when nothing else feels right'),
      ]
    },
    {
      artist:'M.I.A.', album:'AIM (Deluxe)', year:2016, genre:'Electronic', tracks:17,
      image:'images/album-mia-aim.jpg',
      artistDesc:'British rapper and singer',
      artistBio:'M.I.A. is a British rapper, singer, and producer of Sri Lankan Tamil heritage, known for genre-fusing political pop.',
      rating:3.8, reviewCount:23000,
      reviews:[
        rv(5,4.5,'they never miss and this is proof. instant favorite'),
        rv(5,4,'still finding new details months later. what a record'),
        rv(2,4,'warm and immediate but deep enough to sit with for weeks'),
      ]
    },
    {
      artist:'Kid Cudi', album:'Man On The Moon: The End Of Day', year:2009, genre:'Hip-hop', tracks:15,
      image:'images/album-kidcudi-manonthemoontheendofda.jpg',
      artistDesc:'American rapper and singer',
      artistBio:'Kid Cudi is an American rapper and singer from Cleveland whose moody, melodic style reshaped hip-hop.',
      rating:4.8, reviewCount:72000,
      reviews:[
        rv(0,5,'every element is placed with intention. a real headphone album'),
        rv(2,4.5,'emotionally intelligent and sonically fearless'),
        rv(6,4,'criminally slept on. deserves way more attention than it got'),
      ]
    },
    {
      artist:'Kid Cudi', album:'Man On The Moon II: The Legend Of Mr. Rager', year:2010, genre:'Hip-hop', tracks:17,
      image:'images/album-kidcudi-manonthemooniithelegen.jpg',
      artistDesc:'American rapper and singer',
      artistBio:'Kid Cudi is an American rapper and singer from Cleveland whose moody, melodic style reshaped hip-hop.',
      rating:4.2, reviewCount:72000,
      reviews:[
        rv(1,4.5,'still finding new details months later. what a record'),
        rv(4,4,'bold, weird, and completely their own thing. love it'),
        rv(4,4,'criminally slept on. deserves way more attention than it got'),
      ]
    },
    {
      artist:'Kid Cudi', album:'Entergalactic', year:2022, genre:'R&B', tracks:15,
      image:'images/album-kidcudi-entergalactic.jpg',
      artistDesc:'American rapper and singer',
      artistBio:'Kid Cudi is an American rapper and singer from Cleveland whose moody, melodic style reshaped hip-hop.',
      rating:4.5, reviewCount:25000,
      reviews:[
        rv(1,5,'confident, cohesive, and impossible to shake'),
        rv(6,4.5,'emotionally intelligent and sonically fearless'),
        rv(6,4,'bold, weird, and completely their own thing. love it'),
      ]
    },
    {
      artist:'The Killers', album:'Hot Fuss', year:2004, genre:'Rock', tracks:12,
      image:'images/album-thekillers-hotfuss.jpg',
      artistDesc:'American rock band',
      artistBio:'The Killers are an American rock band from Las Vegas, one of the definitive acts of 2000s indie/arena rock.',
      rating:3.9, reviewCount:78000,
      reviews:[
        rv(3,4.5,'took a couple listens to click and then i couldn\'t stop'),
        rv(2,4,'the atmosphere on this is unmatched. pure mood'),
        rv(5,4,'this is the one i put on when nothing else feels right'),
      ]
    },
    {
      artist:'The Killers', album:'Direct Hits', year:2013, genre:'Alternative', tracks:18,
      image:'images/album-thekillers-directhits.jpg',
      artistDesc:'American rock band',
      artistBio:'The Killers are an American rock band from Las Vegas, one of the definitive acts of 2000s indie/arena rock.',
      rating:3.8, reviewCount:19000,
      reviews:[
        rv(1,4.5,'took a couple listens to click and then i couldn\'t stop'),
        rv(5,4,'a grower that became an all-timer for me'),
        rv(0,4,'criminally slept on. deserves way more attention than it got'),
      ]
    },
    {
      artist:'The Killers', album:'Sam\'s Town', year:2006, genre:'Pop', tracks:12,
      image:'images/album-thekillers-samstown.jpg',
      artistDesc:'American rock band',
      artistBio:'The Killers are an American rock band from Las Vegas, one of the definitive acts of 2000s indie/arena rock.',
      rating:4.3, reviewCount:78000,
      reviews:[
        rv(3,4.5,'hits a nerve you didn\'t know you had. stunning front to back'),
        rv(2,4,'criminally slept on. deserves way more attention than it got'),
        rv(6,4,'the atmosphere on this is unmatched. pure mood'),
      ]
    },
    {
      artist:'Syko', album:'Singles Collection (2017-2023)', year:2025, genre:'Hip-hop', tracks:14,
      image:'images/album-syko-singlescollection.jpg',
      artistDesc:'Recording artist',
      artistBio:'Syko is a recording artist working in a contemporary pop and urban style.',
      rating:4.2, reviewCount:27000,
      reviews:[
        rv(5,4.5,'every element is placed with intention. a real headphone album'),
        rv(2,4,'an immaculate run of songs. the sequencing is perfect'),
        rv(3,4,'textured, patient, and quietly devastating. grows with every listen'),
      ]
    },
    {
      artist:'Syko', album:'Monster', year:2023, genre:'Hip-hop', tracks:10,
      image:'images/album-syko-monster.jpg',
      artistDesc:'Recording artist',
      artistBio:'Syko is a recording artist working in a contemporary pop and urban style.',
      rating:4.4, reviewCount:26000,
      reviews:[
        rv(3,5,'bold, weird, and completely their own thing. love it'),
        rv(6,4.5,'the kind of record that makes you text a friend at 2am'),
        rv(0,4,'this album lives in my head rent free. the replay value is unreal'),
      ]
    },
    {
      artist:'Syko', album:'PLANET SYKO', year:2019, genre:'Hip-hop', tracks:7,
      image:'images/album-syko-planetsyko.jpg',
      artistDesc:'Recording artist',
      artistBio:'Syko is a recording artist working in a contemporary pop and urban style.',
      rating:4.5, reviewCount:74000,
      reviews:[
        rv(1,5,'confident, cohesive, and impossible to shake'),
        rv(4,4.5,'one of the most complete projects in their catalog. not a wasted moment'),
        rv(3,4,'still finding new details months later. what a record'),
      ]
    },
    {
      artist:'Joey Bada$$', album:'1999', year:2018, genre:'Hip-hop', tracks:15,
      image:'images/album-joeybada-1999.jpg',
      artistDesc:'American rapper',
      artistBio:'Joey Bada$$ is an American rapper from Brooklyn and a co-founder of the Pro Era collective.',
      rating:4.6, reviewCount:61000,
      reviews:[
        rv(2,5,'confident, cohesive, and impossible to shake'),
        rv(2,4.5,'emotionally intelligent and sonically fearless'),
        rv(4,4,'bold, weird, and completely their own thing. love it'),
      ]
    },
    {
      artist:'Joey Bada$$', album:'ALL-AMERIKKKAN BADA$$', year:2020, genre:'Hip-hop', tracks:12,
      image:'images/album-joeybada-allamerikkkanbada.jpg',
      artistDesc:'American rapper',
      artistBio:'Joey Bada$$ is an American rapper from Brooklyn and a co-founder of the Pro Era collective.',
      rating:4.6, reviewCount:26000,
      reviews:[
        rv(3,5,'took a couple listens to click and then i couldn\'t stop'),
        rv(0,4.5,'the atmosphere on this is unmatched. pure mood'),
        rv(0,4,'still finding new details months later. what a record'),
      ]
    },
    {
      artist:'Joey Bada$$', album:'2000', year:2022, genre:'Hip-hop', tracks:14,
      image:'images/album-joeybada-2000.jpg',
      artistDesc:'American rapper',
      artistBio:'Joey Bada$$ is an American rapper from Brooklyn and a co-founder of the Pro Era collective.',
      rating:3.8, reviewCount:10000,
      reviews:[
        rv(5,4.5,'gorgeous songwriting, no filler, endlessly rewarding'),
        rv(0,4,'took a couple listens to click and then i couldn\'t stop'),
        rv(5,4,'the production alone is worth the price of admission'),
      ]
    },
    {
      artist:'Earl Sweatshirt', album:'Why Lawd?', year:2024, genre:'Hip-hop', tracks:19,
      image:'images/album-earlsweatshirt-whylawd.jpg',
      artistDesc:'American rapper',
      artistBio:'Thebe Kgositsile, known as Earl Sweatshirt, is an American rapper from Los Angeles and a former member of Odd Future.',
      rating:4.6, reviewCount:42000,
      reviews:[
        rv(0,5,'emotionally intelligent and sonically fearless'),
        rv(6,4.5,'confident, cohesive, and impossible to shake'),
        rv(4,4,'textured, patient, and quietly devastating. grows with every listen'),
      ]
    },
    {
      artist:'Earl Sweatshirt', album:'LOADING...', year:2025, genre:'Hip-hop', tracks:6,
      image:'images/album-earlsweatshirt-loading.jpg',
      artistDesc:'American rapper',
      artistBio:'Thebe Kgositsile, known as Earl Sweatshirt, is an American rapper from Los Angeles and a former member of Odd Future.',
      rating:4.0, reviewCount:18000,
      reviews:[
        rv(3,4.5,'an immaculate run of songs. the sequencing is perfect'),
        rv(3,4,'the kind of record that makes you text a friend at 2am'),
        rv(0,4,'bold, weird, and completely their own thing. love it'),
      ]
    },
    {
      artist:'Earl Sweatshirt', album:'Animals Have Feelings', year:2016, genre:'Electronic', tracks:22,
      image:'images/album-earlsweatshirt-animalshavefeelings.jpg',
      artistDesc:'American rapper',
      artistBio:'Thebe Kgositsile, known as Earl Sweatshirt, is an American rapper from Los Angeles and a former member of Odd Future.',
      rating:4.6, reviewCount:24000,
      reviews:[
        rv(3,5,'took a couple listens to click and then i couldn\'t stop'),
        rv(6,4.5,'this album lives in my head rent free. the replay value is unreal'),
        rv(3,4,'every element is placed with intention. a real headphone album'),
      ]
    },
  ];

  window.ARTIST_IMG = {
    '$uicideboy$': 'images/artist-uicideboy.jpg',
    '100 gecs': 'images/artist-100gecs.jpg',
    'A. G. Cook': 'images/artist-agcook.jpg',
    'Aphex Twin': 'images/artist-aphextwin.jpg',
    'Arca': 'images/artist-arca.jpg',
    'Asian Kung-Fu Generation': 'images/artist-asiankungfugeneration.jpg',
    'BAYNK': 'images/artist-baynk.jpg',
    'BläZy': 'images/artist-blzy.jpg',
    'Bugseed': 'images/artist-bugseed.jpg',
    'Burial': 'images/artist-burial.jpg',
    'Cake Pop': 'images/artist-cakepop.jpg',
    'CoryaYo': 'images/artist-coryayo.jpg',
    'Crystal Castles': 'images/artist-crystalcastles.jpg',
    'DAVICHI': 'images/artist-davichi.jpg',
    'Daughters': 'images/artist-daughters.jpg',
    'David Bowie': 'images/artist-davidbowie.jpg',
    'Dutch Disorder': 'images/artist-dutchdisorder.jpg',
    'Earl Sweatshirt': 'images/artist-earlsweatshirt.jpg',
    'Epik High': 'images/artist-epikhigh.jpg',
    'Floating Points': 'images/artist-floatingpoints.jpg',
    'Florence + The Machine': 'images/artist-florencethemachine.jpg',
    'Frank Ocean': 'images/artist-frankocean.jpg',
    'Freddie Gibbs': 'images/artist-freddiegibbs.jpg',
    'Freddie Gibbs & Madlib': 'images/artist-freddiegibbsmadlib.jpg',
    'Freddie Gibbs & The Alchemist': 'images/artist-freddiegibbs.jpg',
    'Freestylers': 'images/artist-freestylers.jpg',
    'Frou Frou': 'images/artist-froufrou.jpg',
    'J.Rawls': 'images/artist-jrawls.jpg',
    'JPEGMAFIA': 'images/artist-jpegmafia.jpg',
    'James Blake': 'images/artist-jamesblake.jpg',
    'Jan Panenka': 'images/artist-janpanenka.jpg',
    'Joey Bada$$': 'images/artist-joeybada.jpg',
    'Justice': 'images/artist-justice.jpg',
    'Kanye West': 'images/artist-kanyewest.jpg',
    'Kendrick Lamar': 'images/artist-kendricklamar.jpg',
    'Kid Cudi': 'images/artist-kidcudi.jpg',
    'Leessang': 'images/artist-leessang.jpg',
    'M.I.A.': 'images/artist-mia.jpg',
    'Massive Attack': 'images/artist-massiveattack.jpg',
    'Megumi Hayashibara': 'images/artist-megumihayashibara.jpg',
    'Men I Trust': 'images/artist-menitrust.jpg',
    'Mitski': 'images/artist-mitski.jpg',
    'Mount Kimbie': 'images/artist-mountkimbie.jpg',
    'My Bloody Valentine': 'images/artist-mybloodyvalentine.jpg',
    'Niki Istrefi': 'images/artist-nikiistrefi.jpg',
    'Nirvana': 'images/artist-nirvana.jpg',
    'Phoebe Bridgers': 'images/artist-phoebebridgers.jpg',
    'Pigeondust': 'images/artist-pigeondust.jpg',
    'Portishead': 'images/artist-portishead.jpg',
    'RADWIMPS': 'images/artist-radwimps.jpg',
    'Rezz': 'images/artist-rezz.jpg',
    'SZA': 'images/artist-sza.jpg',
    'Shiro Sagisu': 'images/artist-shirosagisu.jpg',
    'Skepta': 'images/artist-skepta.jpg',
    'Smashing Pumpkins': 'images/artist-smashingpumpkins.jpg',
    'Snail Mail': 'images/artist-snailmail.jpg',
    'Soccer Mommy': 'images/artist-soccermommy.jpg',
    'Sufjan Stevens': 'images/artist-sufjanstevens.jpg',
    'Syko': 'images/artist-syko.jpg',
    'Tame Impala': 'images/artist-tameimpala.jpg',
    'The Killers': 'images/artist-thekillers.jpg',
    'Tim Presley': 'images/artist-timpresley.jpg',
    'Trippie Redd': 'images/artist-trippieredd.jpg',
    'Tyler, the Creator': 'images/artist-tylerthecreator.jpg',
    'Vance Joy': 'images/artist-vancejoy.jpg',
    'Weyes Blood': 'images/artist-weyesblood.jpg',
    'Yoko Kanno': 'images/artist-yokokanno.jpg',
    'Yoko Takahashi': 'images/artist-yokotakahashi.jpg',
    'death\'s dynamic shroud': 'images/artist-deathsdynamicshroud.jpg',
  };

  // Set initial active album and featured albums for home screen
  window.activeAlbum = window.ARCHIVE[0];

  // Shuffle archive fresh on every load
  const shuffled = [...window.ARCHIVE].sort(() => Math.random() - 0.5);
  window.featuredAlbum = shuffled[0];
  window.trendingAlbums = shuffled.slice(1);

  window.openAlbum = function (album) {
    window.activeAlbum = album;
    window.activeArtist = album && album.artist;   // keep the artist page in sync
    if (typeof navigate === 'function') navigate('album');
  };

  // Open a specific artist's page (from an album's artist link, a friend card, etc.)
  window.openArtist = function (name) {
    window.activeArtist = name;
    if (typeof navigate === 'function') navigate('artist');
  };

  // Open an album by (artist, album) — used by the artist page's album grid,
  // which can only pass strings through inline onclick.
  window.openAlbumFor = function (artist, album) {
    const a = (window.ARCHIVE || []).find(x => x.artist === artist && x.album === album);
    if (a) window.openAlbum(a);
  };

  // A friend "recommends" an album when they have activity on it (FRIEND_ACTIVITY).
  // Otherwise the album is algo-served and gets no friend tag.
  window.friendRecFor = function (album) {
    if (!album || !window.FRIEND_ACTIVITY) return null;
    return window.FRIEND_ACTIVITY.find(
      f => f.album === album.album && f.artist === album.artist
    ) || null;
  };

  window.fmtRc = function (n) {
    return n >= 1000 ? (n / 1000).toFixed(1).replace('.0', '') + 'k' : String(n);
  };

  window.FRIEND_ACTIVITY = [
    { user:'echoplex',   init:'E',  grad:'linear-gradient(135deg,#1c1c3e,#3b1fa8)', album:'Crystal Castles',       artist:'Crystal Castles',  year:2010, image:'images/album-crystalcastles1.png',         rating:4.5, quote:'"chaotic and beautiful. alice\'s vocals hit like static shock every time"', likes:14, comments:3, ago:'2h' },
    { user:'staticfog',  init:'SF', grad:'linear-gradient(135deg,#164e63,#0284c7)', album:'Punisher',              artist:'Phoebe Bridgers',   year:2020, image:'images/album-phoebebridgers-punisher.png', rating:5,   quote:'"funeral is the most heartbreaking song i\'ve heard in years, and the rest of the record isn\'t far behind. it\'s quiet in a way that makes you lean in, and then the last two tracks turn the volume up on everything you were already feeling"',           likes:31, comments:7, ago:'5h' },
    { user:'kira_m',     init:'KM', grad:'linear-gradient(135deg,#3b0764,#9333ea)', album:'1000 gecs',             artist:'100 gecs',          year:2019, image:'images/album-100gecs-1000gecs.jpg',         rating:5,   quote:'"this album rewired my brain. nothing before or after sounds like it. i put it on as a joke at a party in 2019 and by the second track everyone had stopped talking, not because they liked it but because nobody could work out what was happening. money machine is a threat, a love song and a ringtone at once. 800db cloud is the sound of a laptop giving up. and then stupid horse comes in like a nursery rhyme and you realise the whole thing is built out of genuinely great hooks that have been put through a blender on purpose. it is the most fun i have ever had being confused"',  likes:22, comments:5, ago:'9h' },
    { user:'nova_wr',    init:'NW', grad:'linear-gradient(135deg,#064e3b,#059669)', album:'Loveless',              artist:'My Bloody Valentine',year:1991, image:'images/album-mbv-loveless.png',             rating:5,   quote:'"sounds like falling through clouds. never gets old"',                  likes:19, comments:4, ago:'11h'},
    { user:'drumkid',    init:'DK', grad:'linear-gradient(135deg,#7c2d12,#ea580c)', album:'To Pimp a Butterfly',   artist:'Kendrick Lamar',    year:2015, image:'images/album-kendrick-tpab.png',            rating:5,   quote:'"an everest of an album. every listen finds something new: a horn line buried under a verse, a sample you missed, a lyric that lands differently now. i\'ve had it on rotation for years and i\'m still not at the top"',            likes:44, comments:11,ago:'1h' },
    { user:'helio',      init:'H',  grad:'linear-gradient(135deg,#134e4a,#0d9488)', album:'Currents',              artist:'Tame Impala',        year:2015, image:'images/album-tameimpala-currents.png',      rating:4.5, quote:'"let it happen alone is worth 5 stars. everything else is a bonus. eight minutes and it never once feels long, the stutter in the middle is the best trick anyone has pulled on a pop record in years. the rest of the album is kevin parker deciding he wants to be a synth-pop producer and being annoyingly good at it straight away. the less i know the better has the bass line of the decade. eventually is the breakup song for people who did the breaking up. i docked half a star because the back third drifts, but honestly i am still playing it front to back most weeks"',    likes:26, comments:6, ago:'3h' },
    { user:'vxblank',    init:'VB', grad:'linear-gradient(135deg,#4c0519,#be123c)', album:'Blonde',                artist:'Frank Ocean',        year:2016, image:'images/album-frankocean-blonde.jpeg',       rating:5,   quote:'"white ferrari still makes me feel like i\'m floating outside myself. the whole back half of this record does, honestly. it\'s the rare album that gets quieter as it goes and somehow bigger at the same time"', likes:51, comments:13,ago:'6h' },
    { user:'marshmist',  init:'MM', grad:'linear-gradient(135deg,#500724,#db2777)', album:'Puberty 2',             artist:'Mitski',             year:2016, image:'images/album-mitski-puberty2.jpg',          rating:5,   quote:'"your best american girl destroyed me. again. i have listened to that song maybe four hundred times and the moment the guitars come in on the second chorus still lands like a door slamming. the whole record is like that, small quiet verses and then a wall. happy is a horror film about a relationship. i bet on losing dogs is the saddest thing she has written and she has written a lot of sad things. it is a short album and it knows exactly how long it needs to be, which is something almost nobody gets right"',                        likes:33, comments:8, ago:'13h'},
    { user:'echoplex',   init:'E',  grad:'linear-gradient(135deg,#1c1c3e,#3b1fa8)', album:'Untrue',                artist:'Burial',             year:2007, image:'images/album-burial-untrue.jpg',            rating:5,   quote:'"what 3am in a city actually sounds like. pure ache and texture. i first heard this on a night bus with a broken window and it has never sounded better than that, the rain getting in and archangel looping. every voice on it is somebody you half remember. the crackle is not a gimmick, it is the room. people call it dubstep and it is technically true and completely useless as a description. it is a record about being awake when you should not be, and it is the only one that gets the feeling exactly right"',      likes:17, comments:2, ago:'14h'},
    { user:'staticfog',  init:'SF', grad:'linear-gradient(135deg,#164e63,#0284c7)', album:'Good Kid, M.A.A.D City',artist:'Kendrick Lamar',    year:2012, image:'images/album-kendrick-gkmc.jpg',            rating:4.5, quote:'"cinematic and relentless. backseat freestyle is pure serotonin"',      likes:28, comments:9, ago:'16h'},
    { user:'nova_wr',    init:'NW', grad:'linear-gradient(135deg,#064e3b,#059669)', album:'IGOR',                  artist:'Tyler, the Creator', year:2019, image:'images/album-tyler-igor.jpg',               rating:4.5, quote:'"a heartbreak concept album nobody asked for but everyone needed. the sequencing is the story, so listen front to back or don\'t bother. the last three songs only work if you\'ve sat through the first eight"',      likes:23, comments:6, ago:'18h'},
    { user:'drumkid',    init:'DK', grad:'linear-gradient(135deg,#7c2d12,#ea580c)', album:'Mezzanine',             artist:'Massive Attack',     year:1998, image:'images/album-massiveattack-mezzanine.png',  rating:4.5, quote:'"angel is one of the best songs ever made. period."',                   likes:20, comments:3, ago:'20h'},
    { user:'helio',      init:'H',  grad:'linear-gradient(135deg,#134e4a,#0d9488)', album:'Ctrl',                  artist:'SZA',                year:2017, image:'images/album-sza-ctrl.png',                 rating:4.5, quote:'"drew barrymore and the weekend are songs about real feelings"',        likes:38, comments:10,ago:'22h'},
    { user:'vxblank',    init:'VB', grad:'linear-gradient(135deg,#4c0519,#be123c)', album:'Veteran',               artist:'JPEGMAFIA',          year:2018, image:'images/album-jpegmafia-veteran.jpg',        rating:5,   quote:'"noise and rap somehow perfectly fused. completely one of a kind"',     likes:12, comments:4, ago:'1d' },
    { user:'marshmist',  init:'MM', grad:'linear-gradient(135deg,#500724,#db2777)', album:'Be the Cowboy',         artist:'Mitski',             year:2018, image:'images/album-mitski-bethecowboy.jpg',       rating:4.5, quote:'"nobody is the kind of bop that also makes you cry in the car"',       likes:29, comments:7, ago:'1d' },
    { user:'kira_m',     init:'KM', grad:'linear-gradient(135deg,#3b0764,#9333ea)', album:'Dummy',                 artist:'Portishead',         year:1994, image:'images/album-portishead-dummy.png',         rating:5,   quote:'"glory box is the most haunting thing ever recorded by anyone"',        likes:24, comments:5, ago:'1d' },
  ];
})();
