const express = require('express')
const app = express()
const fs = require('file-system')
const multer = require("multer")
const moment = require('moment')
const dotenv = require('dotenv')
const nodemailer = require("nodemailer")
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser')
const jsonfile = require('jsonfile');
const db = require('./db')
const path = require("path")
const os = require('os')


dotenv.config({ path: './.env' })
app.use(bodyParser.urlencoded({
    extended: false
}));

var urlencodedParser = bodyParser.urlencoded({ extended: false })

moment.locale("ka");

const ftime = moment().format('LTS');
const t = moment().format('LT');
const d = moment().format('L');
const fulldate = `${t} სთ , ${d} წელი`
const indbdate = `${d}, ${ftime}`;


function indbdates() {
    return indbdate
}

// random generators

function randomnames() {
    return Math.floor((Math.random() * 10000000) + 1);   
}
function randomsecurename() {
    var charsNumber   = "0123456789";
	var charsLower    = "abcdefghijklmnopqrstuvwxyz";
	var charsUpper    = "ABCDEFGHIJKLMNOPQRSTUVWXTZ";
	var charsAll      = [charsNumber,charsLower,charsUpper];

	var chars = charsAll.join('');
	var stringLength  = 8;
	var randomString  = '';
	for (var i = 0; i < stringLength; i++) {                               
		var randNum   = Math.floor(Math.random() * chars.length);  
		randomString  += chars.substring(randNum,randNum+1);   
	}

	return randomString; 
}
var deleted = randomsecurename() + 235
var edit = randomsecurename() + 20
var delmedia = randomsecurename() + 40
var review = randomsecurename()
var reser = randomsecurename() + 230
// end


app.use(express.static('public'))
app.use(express.json())
app.use(expressLayouts);
app.set('layout', './layout/index')
app.set('view engine', 'ejs')

// routers

app.get("/", (req, res) => {
                              
    res.render('home', {title: 'მთავარი || Appolo' })
})
app.get("/about", (req, res) => {
    res.render('about', { title: 'შესახებ || Appolo' })
})
app.get("/blogs", (req, res) => {
    db.query('SELECT * FROM blogs', function (error, results, fields) {
        let blogcount = ''
        let blogmodals = ''      
        let blognames = ''
        if (error) throw error;
        
        results.forEach(b => {
            blogcount = `
                ჯამში: ${results.length}</h2>
            `
            blognames += `
                <div class="col-md-4 col-sm-4">
                    <div class="gallery-thumb">
                        <div class="card ">
                            <div class="card-imgs">
                                <img src="../../blogimgs/${b.blogimgs}" class="card-img-top" alt="${b.blogimgs}">

                            </div>

                            <div class="card-body">
                                <h5 class="card-title">${b.blogname}</h5>
            
                                <a href="/blogs/review-${review}/${b.ID}" class="btn btn-primary" target="_blank" >ვრცლად</a>

                            </div>
                            <div class="card-footer">
                                <small class="text-muted">${b.insertdate}</small>
                            </div>
                        </div>
                    </div> 
                </div>` 
                app.get(`/blogs/review-${review}/${b.ID}`, (req, res) => {
                    db.query(`SELECT * FROM blogs WHERE ID = ${b.ID}`, function (error, results, fields) {
                        let revs = '';
                        if (!error) {
                            results.forEach(rev => {
                                revs += `
                                    <div class="getcenter" id="read">
                                        <div class="revs">
                                            <div class="revimgs">
                                                <div class="backbtn"> 
                                                    <a href="/blogs">უკან</a>
                                                </div>
                                                <img src="../../blogimgs/${rev.blogimgs}" alt="${rev.blogimgs}">
                                            </div>
                                            <div class="revstxt">
                                                <div class="txt">
                                                    <h5 class="revs-title">
                                                        ${rev.blogname}
                                                        <span>${rev.insertdate}</span>
                                                    </h5>
                                                    <p class="revs-text">${rev.blogtxt} </p>
                                                </div>
                                               
                                            </div>
                                        </div>
                                        
                                    </div>
                            
                                `
                            })
                            res.render('blogs', {bloglist:"",blogcount: "",review: revs,title: 'ბლოგის ნახვა',layout: './layout/singleblog'});

                        }
        
                    })
                    
                })

            x = b.insertSqldate = '' 
 
            
        });
        if (results.length == 0) {
            blognames = `<div class="blognull ninomk">
            <div>
                <h3>ბლოგი არ მოიძებნება</h3>
            </div>
        </div>`
        }
        res.render('blogs', {blogmodals:blogmodals,blogcount: blogcount,bloglist:blognames,title: 'ბლოგები || Appolo'});
        
    })
})



// სხვა

app.get("/adminlogin/resers", (req, res) => {
    db.query('SELECT * FROM reser', function (error, results, fields) {
        let resercount = ''
        let resers = ''
        if (error) throw error;
        
        results.forEach(r => {
            resercount = `
                ჯამში: ${results.length}</h2>
            `
         
            
            resers += `
                <div class="card text-dark bg-light mb-3" style="max-width: 23rem;">
                    <div class="card-header">${r.reser_id}</div>
                    <div class="card-body">
                        <h5 class="card-title">${r.fullname}</h5>
                        <h5 class="card-title">${r.email}</h5>
                        <h5 class="card-title">${r.mobile}</h5>
                        <h5 class="card-title">${r.reser_time}, ${r.reser_date}</h5>
                        <h5 class="card-title">${r.price}</h5>
                        <p class="card-text">
                            <a type="button" class="btn btn-danger" href="del-${deleted}/${r.ID}">წაშლა</a>
                            <a type="button" class="btn btn-primary" href="edit-${edit}/${r.ID}">რედაქტირება</a>
                            
                            <form action="/sendok" method="post">
                                <input type="email" readonly name="okemail" placeholder="${r.email}" class="r" value="${r.email}">
                                <button type="submit" class="btn btn-primary ">ok</button>
                            </form>
                            
                            <form action="/sendnot" method="post">
                                <input type="email" readonly placeholder="${r.email}" class="r" value="${r.email}">
                                <button type="submit" class="btn btn-primary ">unok</button>
                            </form>
                            
                        </p>
                    </div>
                </div>
            ` 
            app.post("/sendok",urlencodedParser, (req, res) =>{
                let ok = req.body.okemail
                
                const transporter = nodemailer.createTransport({
                    host: process.env.host,
                    port: process.env.port,
                    secure: true,
                    auth: {
                        user: process.env.usermail,
                        pass: process.env.passuser,
                    },
                });
                const ordersend = {
                    attachments: [{
                        filename: 'applosuccess.jpg',
                        path: "public/images/mainbg.jpg",
                        cid: 'public/images/mainbg.jpg' //same cid value as in the html img src
                    }],
    
                    from: `support@appolosuccess.ge`,
                    to: `${ok}`,
                    subject: `ონლაინ დაჯავშნის დამოწმება`,
                   
                    html: ` <div style="list-style: none; background: #1d2723; color: #4c6769;padding:1rem;border-radius:5px;text-align:center"> 
                                <h3>შენი ჯავშანი დამოწმებულია მომდევნო შეტყობინებაზე ელოდე ონლაინ შეხვედრის ბმულს </h3>
                            </div>`,
                }
                let sent = ``
                transporter.sendMail(ordersend, (res,error, info, sent) => {

                    if (!error) {
                        sent = `<div class="alert alert-warning alert-dismissible fade show" role="alert">
                                    <strong>გაიგზავნა,${ok}</strong>
                                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                                </div>`
                       
                    }
                    else {
                        
                        sent =  `არ გაიგზავნა`
                        
    
                    }
                    return sent
                })
                res.render('./layout/resers', {sent:sent,st: "",reserscount: resercount,reserslist:resers,  layout: './layout/resers' });


            })
            app.get(`/adminlogin/del-${deleted}/${r.ID}`, (req, res) => {
                db.query('DELETE FROM reser WHERE ID = ? ', [r.ID], function(err, rows, fields) {
                    let st = ''
                    if (!err) {
                      st = `
                        <div class="alert alert-warning alert-dismissible fade show" role="alert">
                            <strong>წაიშალა ჯავშანი</strong> # ${req.body.params}
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>`
                    }
                    else {
                        console.log("not deleted");
                        
                    }
                    res.render('./layout/resers', {sent:" ",st: st,reserscount: resercount,reserslist:resers, layout: './layout/resers' });

                })
            })
            
        });
        if (results.length == 0) {
            resers = `<div class="blognull ninomk">
            <div>
                <h3>ჯავშანი არ მოიძებნება</h3>
            </div>
        </div>`
        }
        res.render('./layout/resers', {sent: "", st: "",reserscount: resercount,reserslist:resers, layout: './layout/resers' });
        
    })
})


// ენდ



app.get("/contact", (req, res) => {
    res.render('contact', {emailst:"გაგზავნა", title: 'კონტაქტი || Appolo' })
})
app.get("/admin", (req, res) => {
    res.render('./layout/loginadm', {title: 'პანელი || Appolo',layout: './layout/loginadm' })
})

// upload

function timedates() {
    return fulldate
}

let folderPaths = path.join(__dirname, '/public/blogimgs/')


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, folderPaths)
    },
    filename: function (req, file, cb) {
        x = randomnames()
        xxx = x + path.extname(file.originalname) 
        cb(null, x + path.extname(file.originalname))
    }
  })
const upload = multer({
    storage: storage
});

app.post('/adminlogin',(req, res) => {
	// Capture the input fields
    let username = req.body.admname;
	let password = req.body.admpass;
    // let ip_addrs = ip

    // const logreport = {
       // user: username,
        // ip: ip_addrs,
        // logdate: timedates()
    // }
	// Ensure the input fields exists and are not empty
	if (username && password) {
		// Execute SQL query that'll select the account from the database based on the specified username and password
		db.query('SELECT * FROM logins WHERE user = ? AND pass = ?', [username, password], function(err, results, fields) {
           

			// If there is an issue with the query, output the error
            if (err) {
               console.log(err);
            }
			// If the account exists
			if (results.length > 0) {
               // db.query('INSERT INTO logreport SET ?', logreport)
                
                db.query('SELECT * FROM blogs', function (erro, results) {

                    let blogcounter = ''
                    let blogname = ''
                    
                    if (results.length > 0) {
                        results.forEach(b => {
                            blogcounter = `
                            <div class="alert alert-success" role="alert">
                                ბლოგთა ნუსხა საერთო ჯამში : ${results.length}</h2>
                            </div>`
    
                           
                            blogname += `
                            <div class="col">
                                    <div class="card">
                                        <p class="blogid">ID: ${b.ID}</p>
                                        <img src="../../blogimgs/${b.blogimgs}" class="card-img-top" alt="${b.blogimgs}">
                                        <div class="card-body">
                                            <h5 class="card-title">${b.blogname}</h5>
                                            <p class="card-text">${b.blogtxt}</p>
                                        </div>
                                        <div class="card-footer">
                                            <small class="text-muted">${b.insertdate}</small>
                                            <hr>
                                            <div class="blogsett">
                                                <a href="/adminlogin/delete-${deleted}/${b.ID}" target="_blank" >წაშლა</a>
                                                <a href="/adminlogin/edit-${edit}/${b.ID}" target="_blank">რედაქტირება</a>
                                                
                                            </div>
    
                                                
                                        </div>
                                    </div>
                                </div>      
                                
                                
                            `;
                            
                            x = b.insertSqldate = ''
                        })
                    }                    
                    else {
                        blogname = `
                            <div style="display: flex; align-items: center; justify-content: center;align-content: center;height: 100vh;width: 100%;">
                                <div class="alert alert-danger" role="alert">
                                    <h6>ბლოგი არ მოიძებნება , რაოდენობა 0</h6>
                                </div>
                            </div>
                        
                        `
                        blogcounter = ""
                    }
                    app.get(`/adminlogin/medias`, (req, res)=> {

                        fs.readdir('public/blogimgs', (err, data) => {
                            let readf = ""
                            let datacount = ""
                     
                            data.forEach(y => {
                                datacount = `<div class="alert alert-success" role="alert">
                                    <h4>მედია ფაილები სულ: ${data.length}</h4>
                                </div>`
                                readf += `<figure class="figure">
                                    <img src="../../blogimgs/${y}" class="figure-img img-fluid rounded exten" alt="${y}">
    
                                    <figcaption class="figure-caption text-center p-2">
                                    <a href="/adminlogin/delmedias-${delmedia}/${y}" target="_blank">
                                        <i class="fa-solid fa-trash-can"></i>
                                    </a>

                                    &ThinSpace;
                                    სახელი: ${y}</figcaption>
                                </figure>`

                                app.get(`/adminlogin/delmedias-${delmedia}/${y}`, (req, res) => {
                                    
                                    fs.unlink(`public/blogimgs/${y}`, function (err) {
                                        
                                        let delstatus = ''
                                        if (!err) {
                                            delstatus = `<div class="alert alert-success" role="alert">
                                                            <h4><i class="fa-solid fa-check"></i> &ThinSpace; მედია ფაილი წაიშალა: ${y}</h4>
                                                        </div>`
                                        
                                        }
                                        else {
                                            delstatus = `<div class="alert alert-danger" role="alert">
                                                            <h4><i class="fa-solid fa-xmark"></i> &ThinSpace; მედია ფაილი არ წაიშალა: ${y}</h4>
                                                        </div>`
                                          
                                        }
                                        res.render('./layout/del', {title: "მედია ფაილები",delstatus:delstatus, layout: './layout/del'});

                                    });
            
                                })

                            })
                            if (data.length == 0) {
                                readf = `
                                <div style="display: flex; align-items: center; justify-content: center;align-content: center;height: 100vh;width: 100%;">
                                    <div class="alert alert-danger" role="alert">
                                        <h6>მედია არ მოიძებნება , რაოდენობა 0</h6>
                                    </div>
                                </div>`
                            }
                            res.render('./layout/mediafiles', {datacount: datacount,readfile:readf,title: 'მედია ფაილები', layout: './layout/mediafiles'});

                        });
                    })
                    
    				res.render('./layout/admpanel', {filters: "",blogcount:blogcounter,blogs:blogname,fulldate: fulldate,blogalert: " ", layout: './layout/admpanel'});
                
                    app.get(`/adminlogin/delete-${deleted}/:id`, (req, res) => {

                        let deleted =  `<div class="alert alert-success" role="alert">
                            <h2>წაიშალა ბლოგი დრო: (${fulldate})</h2>
                        </div>`
                        let delnot = `<div class="alert alert-danger" role="alert">
                            <h2>არ წაიშალა ბლოგი დრო: (${fulldate})</h2>
                        </div>`
                        db.query('DELETE FROM blogs WHERE ID = ? ', [req.params.id], function(err, rows, fields) {
                            if (!err) {
                                res.render('./layout/del', {title: "წაიშალა ბლოგი ",delstatus:deleted, layout: './layout/del'});
                               
                            }
                            else {
                                console.log(err);
                                res.render('./layout/del', {title: "არ წაიშალა ბლოგი ",delstatus:delnot, layout: './layout/del'});
                                
                            }
                        })
                    })

                    app.get(`/adminlogin/edit-${edit}/:id`, (req, res) => {
                        
                        db.query(`SELECT * FROM blogs WHERE ID = ${req.params.id}`, function (error, results, fields) {
                            
                            if (error) throw error;
                                
                            let blognames = '';
                            let blogimgs = '';
                            let blogfilter = '';
                            let blogtxt = '';
                            results.forEach(n => {
                                blognames = n.blogname
                                blogimgs = n.blogimgs
                                blogfilter = n.blogfilter
                                blogtxt = n.blogtxt
                            })

                            res.render('./layout/editing', {title: "რედაქტირება ბლოგის ",editnum:req.params.id,blognm:blognames, blogig:blogimgs , blogft:blogfilter , blogtxt:blogtxt ,layout: './layout/editing'});
                              
                        });
                        
                    })
                    
                })
                app.post(`/e`,upload.array("blogimgs", 2), (req, res) => {
                    let blogimgs = xxx
                    
                    let editok =  `<div style="color:green">
                        <h2>ბლოგი დარექდატირდა</h2>
                    </div>`
                    let editno = `<div style="color:darkred">
                        <h2>არ დარექდატირდა ბლოგი: ${req.params.id}</h2>
                    </div>`
                   
                    
                    db.query(`UPDATE blogs SET
                            blogname  = '${req.body.bloghead}',
                            blogfilter = '${req.body.blogfilter}',
                            blogtxt = '${req.body.blogtxt}',
                            blogimgs = '${blogimgs}',
                            insertdate = '${fulldate}'
                            WHERE ID = ${req.body.blogid} `, function(err, rows, fields) {
                        if (!err) {
                          

                            res.render('./layout/editstatus', {title: "წარმატებით რედაქტირდა" ,editstatus:editok, layout: './layout/editstatus'});
                             
                            
                        }
                        else {
                            console.log(err);                             
                            res.render('./layout/editstatus', {title: "არ რედაქტირდა" ,editstatus:editno, layout: './layout/editstatus'});
                                                         
                        }
                    })
                    
                })
                    
                app.post('/blog', upload.array("blogimgs", 2),(req, res) => {
                    let blogimgs = xxx
                    let bloghead = req.body.bloghead
                    let blogfilter = req.body.blogfilter
                    let blogtxt = req.body.blogtxt
                    
                    const params = {
                        blogname: bloghead,
                        blogfilter: blogfilter,
                        blogtxt: blogtxt,
                        blogimgs:blogimgs,
                        insertdate: fulldate

                    }
                   
                    let blogadd = `<div class="alert alert-success alert-dismissible fade show" role="alert">
                                        <strong>ბლოგი დაემატა!</strong> შეგიძლია ნახო  <a href="/blogs" target="_blank" class="alert-link"> CLICK</a>.
                                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                                    </div>`
                    let blognot = `<div class="alert alert-danger" role="alert">
                                        ბლოგი არ დაემატა: ${fulldate} 
                                    </div>`
                  
                    db.query('INSERT INTO blogs SET ?', params , (err, rows) => {
                        
                        if(!err) {

                            db.query('SELECT * FROM blogs', function (error, results, fields) {
                                let blogcounter = ''
                                
                                let blognames = ''
                                if (error) throw error;
                                
                                results.forEach(b => {
                                    blogcounter = `
                                    <div class="alert alert-success" role="alert">
                                        ბლოგთა ნუსხა საერთო ჯამში : ${results.length}</h2>
                                    </div>`

                                    blognames += `
                                        <div class="col">
                                            <div class="card">
                                                <img src="../../blogimgs/${b.blogimgs}" class="card-img-top" alt="${b.blogimgs}">
                                                <div class="card-body">
                                                    <h5 class="card-title">${b.blogname}</h5>
                                                    <p class="card-text">${b.blogtxt}</p>
                                                </div>
                                                <div class="card-footer">
                                                    <small class="text-muted">${b.insertdate}</small>
                                                    <hr>
                                                    <div class="blogsett">
                                                    <a href="/adminlogin/delete-${deleted}/${b.ID}" target="_blank" >წაშლა</a>
                                                    <a href="/adminlogin/edit-${edit}/${b.ID}" target="_blank">რედაქტირება</a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>      
            
                                    `;
                                 
                                    x = b.insertSqldate = '' 
                                    
                                });
                                res.render('./layout/admpanel', {filters: "",blogcount: blogcounter,blogs:blognames,fulldate: fulldate,blogalert: blogadd, layout: './layout/admpanel'});
                                
                                  
                            });

            
                        } else {
                            console.log("ipaaa " + err)
				            res.render('./layout/admpanel', {filters: "",fulldate: fulldate,blogalert: blognot, layout: './layout/admpanel'});

                        }
            
                    })
                })
				
			} else {
				res.render('./layout/err', {layout: './layout/err'});
			}			
		});

	} else {
		res.send('Please enter Username and Password!');
		res.end();
	}
});

// end

// add filter 
app.get(`/adminlogin/filter`, (req, res) => {
    app.post('/addfilte',urlencodedParser, (req, res) => {
        const filter = req.body.addfilter
        const filt = {
            filters: filter,
            adddate:fulldate
        }
        db.query(`INSERT INTO filter SET ?`, filt , (err, rows) => {
            if(!err) {
                db.query('SELECT * FROM filter', function (error, results, fields) {
                    
                    let filtcounter = ''
                    let filts = ''
                    if (error) throw error;
                    
                    results.forEach(f => {
                       
                        filtcounter = `
                        <div class="alert alert-success" role="alert">
                            დაემატა  : ${results.length}</h2>
                        </div>`
    
                        filts += `
                            <tr>
                                <th scope="row">${f.id}</th>
                                <td>${f.filters}</td>
                                <td>${f.adddate}</td>
                                <td>  
                                    <a href="/adminlogin/filter/delfilt-${deleted}/${f.id}" target="_blank" class="btn btn-danger">წაშლა</a>
                                    <a href="/adminlogin/filter/editfilt-${review}/${f.id}" target="_blank" class="btn btn-primary">რედაქტირება</a>
                                </td>
                                
                            </tr>
                        `;
                     
                    });
                    res.render('./layout/filter', {filtcounter:filtcounter,filters: filts,title:"ჟანრები", layout: './layout/filter'});
                      
                });
            }
            else {
                console.log("filter err " + err);
            }
        })
        
    })
    db.query('SELECT * FROM filter', function (error, results, fields) {
                    
        let filtcounter = ''            
        let filts = ''
        if (error) throw error;
        
        results.forEach(f => {
            filtcounter = `
            <div class="alert alert-success" role="alert">
                საერთო ჯამში : ${results.length}</h2>
            </div>`

            filts += `
                <tr>
                    <th scope="row">${f.id}</th>
                    <td>${f.filters}</td>
                    <td>${f.adddate}</td>
                    <td>  
                        <a href="/adminlogin/filter/delfilt-${deleted}/${f.id}" target="_blank" class="btn btn-danger">წაშლა</a>
                        <a href="/adminlogin/filter/editfilt-${review}/${f.id}" target="_blank" class="btn btn-primary">რედაქტირება</a>
                    </td>
                    
                </tr> 
             
            `;
            
        });
        res.render('./layout/filter', {filtcounter: filtcounter,filters: filts,title:"ჟანრები", layout: './layout/filter'}); 
          
    });
    
})

// end

// reservation meets

app.post('/reser',urlencodedParser, (req, res) => {
    let reserID = req.body.reser_id
    let fullname = req.body.fullname
    let email = req.body.email
    let mobile = req.body.mobile
    let price = req.body.price
    let reserdate = req.body.reserdate
    let reserdate1 = req.body.reserdate1

    let reserdb = {
        reser_id: reserID,
        fullname: fullname,
        email: email,
        mobile: mobile,
        reser_time: reserdate,
        reser_date: reserdate1,
        price: price,
        order_date: timedates()
    }
    db.query(`INSERT INTO reser SET ?`, reserdb , (err, rows) => {

        if (!err) {
            
            db.query(`SELECT * FROM reser WHERE reser_id = ${reserID}`, (err, rows) => {
                let reser = ''
                rows.forEach(resers => {
                    reser = `
                    <ul> 
                        <li style="color:green">ID: ${resers.reser_id} </li>
                        <li>სახელი და გვარი: ${resers.fullname} </li>
                        <li>მეილი: ${resers.email} </li>
                        <li>მობილურის ნომერი: ${resers.mobile} </li>
                        <li>თარიღი: ${resers.reser_date}, ${resers.reser_time} </li>
                        <li>ფასი: ${resers.price} </li>
                        <li>დაჯავშნის დრო: ${resers.order_date} </li>
                        <li><%- sentemail -> </li>
                    </ul>`
                })
                res.render('./layout/editstatus', {title: "დაჯავშნის სტატუსი", editstatus: `დაიჯავშნა წარმატებით ${reser}`, layout: './layout/editstatus'});

            })

                        
            const transporter = nodemailer.createTransport({
                host: process.env.host,
                port: process.env.port,
                secure: true,
                auth: {
                user: process.env.usermail,
                pass: process.env.passuser,
                },
            });
            const ordersend = {
                attachments: [{
                    filename: 'applosuccess.jpg',
                    path: "public/images/mainbg.jpg",
                    cid: 'public/images/mainbg.jpg' //same cid value as in the html img src
                }],

                from: `support@appolosuccess.ge`,
                to: `${email}`,
                subject: `ონლაინ დაჯავშნა`,
                text: `დამჯავშნელი: ${fulldate}`,
                html: ` <div style="list-style: none; background: #1d2723; color: #4c6769;padding:1rem;border-radius:1rem"> 
                            <h3>ძვირფასო, ${fullname} შენ წარმატებით დაჯავშნე აპპოლო წარმატების სივრცის ონლაინ დაჯავშნა სხვა ინსტრუქციას მეილზე ან ნომერზე ელოდე არანაკლებ 72 საათის მანძილზე</h3>
                            <p style="color:#f19333">ID: ${reserID} </p>
                            <p>სახელი და გვარი: ${fullname} </p>
                            <p>დამჯავშნელის მეილი: ${email} </p>
                            <p>მობილურის ნომერი: ${mobile} </p>
                            <p>თარიღი: ${reserdate}, ${reserdate1} </p>
                            <p>ფასი: ${price} </p>
                        </div>`,
            }

            transporter.sendMail(ordersend, (error, info) => {
                if (!error) {
                    console.log("order sent to email")
                }
                else {
                    
                    console.log("order not sent to email")
                    

                }
            })

        }
        else {
            res.render('./layout/editstatus', {title: "დაჯავშნა არ მოხერხდა", editstatus: `დაიჯავშნა არ მოხერხდა`, layout: './layout/editstatus'});
            
            
        }

    })
})

// end
// send mail

app.post('/contact',urlencodedParser, (req, res) => {
  
    const transporter = nodemailer.createTransport({
        host: process.env.host,
        port: process.env.port,
        secure: true,
        auth: {
          user: process.env.usermail,
          pass: process.env.passuser,
        },
    });
    const mailOptions = {
        // attachments: [{
        //     filename: 'i1.jpg',
        //     path: "imgs/i1.jpg",
        //     cid: 'imgs/i1.jpg' //same cid value as in the html img src
        // }],

        from: req.body.name,
        to: 'support@appolosuccess.ge , mishiko.kuprava20@gmail.com',
        subject: `${req.body.subject}`,
        text: `message from: ${req.body.name}(${req.body.email}),\nmessage: ${req.body.message}`,
        html: `<div style="background: #ddd;color:#2c363a;padding:1rem;border-radius:5px;">
                    <h4>გამომგზავნი: ${req.body.name}</h4>
                    <h4>გამომგზავნის მეილი: ${req.body.email}</h4>
                    <h4>გამომგზავნის შეტყობინება: ${req.body.message}</h4>
                </div>`,
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if (!error) {
            res.render('contact', {emailst:"გაიგზავნა", title: "გაიგზავნა" })
        }
        else {
            
            res.render('contact', {emailst:"არ გაიგზავნა", title: "არ გაიგზავნა" })

        }
    })
})

const hostname = "127.0.0.9";
const port = 3001;
app.listen(port, hostname, function () {
    console.log(`Server running at http://${hostname}:${port}/`);
    console.log(`On time: ${ftime}`);
})