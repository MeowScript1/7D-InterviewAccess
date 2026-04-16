import sqlite3
from datetime import datetime, timedelta

DATABASE = "interviews.db"

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()

    c.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            name     TEXT NOT NULL,
            email    TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            skills   TEXT DEFAULT '',
            resume_text TEXT DEFAULT ''
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS jobs (
            id               INTEGER PRIMARY KEY AUTOINCREMENT,
            company          TEXT NOT NULL,
            role             TEXT NOT NULL,
            skills_required  TEXT NOT NULL,
            location         TEXT NOT NULL,
            location_url     TEXT DEFAULT '',
            location_desc    TEXT DEFAULT '',
            date             TEXT NOT NULL,
            walkin_time      TEXT NOT NULL DEFAULT '10:00 AM - 4:00 PM',
            avg_salary       TEXT NOT NULL DEFAULT '5-10 LPA',
            company_about    TEXT DEFAULT '',
            job_description  TEXT DEFAULT '',
            responsibilities TEXT DEFAULT '',
            qualifications   TEXT DEFAULT '',
            interview_steps  TEXT DEFAULT ''
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS applications (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id    INTEGER NOT NULL,
            job_id     INTEGER NOT NULL,
            status     TEXT DEFAULT 'applied',
            applied_at TEXT NOT NULL,
            ai_score   INTEGER DEFAULT 0,
            ai_summary TEXT DEFAULT '',
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (job_id)  REFERENCES jobs(id)
        )
    """)

    conn.commit()

    if c.execute("SELECT COUNT(*) FROM jobs").fetchone()[0] == 0:
        _seed_jobs(conn)

    conn.close()


def _seed_jobs(conn):
    today = datetime.now()
    def d(offset):
        return (today + timedelta(days=offset)).strftime("%Y-%m-%d")

    jobs = [
        {
            "company": "Google", "role": "Python Developer",
            "skills_required": "Python,Django,SQL,REST",
            "location": "Bangalore", "date": d(1),
            "walkin_time": "10:00 AM – 4:00 PM", "avg_salary": "18-25 LPA",
            "location_url": "https://maps.app.goo.gl/example1",
            "location_desc": "Google India Pvt. Ltd., 3, RMZ Infinity, Old Madras Rd, Doorvani Nagar, Bengaluru, Karnataka 560016",
            "company_about": "Google LLC is an American multinational technology company focusing on online advertising, search engine technology, cloud computing, and AI. Google is one of the most valuable companies in the world and offers world-class benefits and compensation.",
            "job_description": "We are looking for a skilled Python Developer to join our engineering team. You will design, build, and maintain efficient, reusable, and reliable Python code. You will work closely with product and design teams to deliver scalable backend services that power millions of users worldwide.",
            "responsibilities": "Design and build high-performance backend services using Python and Django|Collaborate with frontend engineers to integrate RESTful APIs|Write clean, testable, and well-documented code|Optimize application for speed and scalability|Participate in code reviews and technical discussions|Work in an agile environment with bi-weekly sprints",
            "qualifications": "Bachelor's degree in Computer Science or related field|2+ years of professional Python development experience|Strong knowledge of Django and REST APIs|Experience with SQL databases and query optimization|Familiarity with cloud platforms (GCP preferred)|Excellent problem-solving and communication skills",
            "interview_steps": "Walk-in Registration & Document Verification|Online Coding Test (45 mins - Python/DSA)|Technical Round 1 - Core Python & Django|Technical Round 2 - System Design|HR Discussion & Offer"
        },
        {
            "company": "Amazon", "role": "Backend Engineer",
            "skills_required": "Java,Spring,SQL,Microservices",
            "location": "Hyderabad", "date": d(1),
            "walkin_time": "9:00 AM – 3:00 PM", "avg_salary": "20-30 LPA",
            "location_url": "https://maps.app.goo.gl/example2",
            "location_desc": "Amazon Development Centre, Divyasree Techno Park, Whitefield, Hyderabad, Telangana 500081",
            "company_about": "Amazon is a global technology and e-commerce company. AWS is the world's leading cloud platform. Working at Amazon means working at scale — millions of transactions per second.",
            "job_description": "As a Backend Engineer at Amazon, you will build and scale the core services that power our e-commerce and cloud platforms. You will work on challenging distributed systems problems and design microservices that handle millions of requests per second.",
            "responsibilities": "Design and implement scalable microservices using Java and Spring Boot|Build and maintain RESTful APIs|Optimize SQL queries and database performance at scale|Participate in on-call rotation and incident response|Write unit and integration tests|Mentor junior engineers",
            "qualifications": "Bachelor's or Master's in Computer Science|3+ years of Java development experience|Strong understanding of microservices architecture|Experience with Spring Boot, Hibernate, and SQL|Knowledge of AWS services is a plus",
            "interview_steps": "Walk-in Registration|Aptitude & Reasoning Test (30 mins)|Data Structures & Algorithms Round|System Design Round|Bar Raiser Round|HR & Compensation Discussion"
        },
        {
            "company": "Microsoft", "role": "Frontend Developer",
            "skills_required": "HTML,CSS,JavaScript,React",
            "location": "Pune", "date": d(2),
            "walkin_time": "10:00 AM – 5:00 PM", "avg_salary": "16-22 LPA",
            "location_url": "https://maps.app.goo.gl/example3",
            "location_desc": "Microsoft India (R&D) Pvt. Ltd., Embassy TechZone, Rajiv Gandhi Infotech Park, Hinjewadi, Pune, Maharashtra 411057",
            "company_about": "Microsoft Corporation develops, manufactures, licenses, supports, and sells computer software and services. Products include Windows, Azure, Office, and Xbox.",
            "job_description": "We are hiring a Frontend Developer to build responsive, accessible, and beautiful user interfaces. You will work with designers to translate mockups into pixel-perfect components.",
            "responsibilities": "Build responsive web applications using React and modern JavaScript|Implement UI designs with pixel-perfect accuracy|Optimize application performance|Write reusable, maintainable React components|Collaborate with UX designers and backend engineers",
            "qualifications": "2+ years of frontend development experience|Proficiency in React, JavaScript ES6+, HTML5, and CSS3|Experience with state management|Understanding of web accessibility standards",
            "interview_steps": "Walk-in Registration|UI/UX Aptitude Assessment|Frontend Coding Challenge (React)|Technical Interview|Design Discussion Round|HR Round"
        },
        {
            "company": "Flipkart", "role": "Full Stack Developer",
            "skills_required": "Python,React,SQL,Node",
            "location": "Bangalore", "date": d(2),
            "walkin_time": "9:30 AM – 3:30 PM", "avg_salary": "14-20 LPA",
            "location_url": "https://maps.app.goo.gl/example4",
            "location_desc": "Flipkart Internet Pvt. Ltd., Ozone Manay Tech Park, #56/18 & 55/09, 7th Floor, Garvebhavipalya, Hosur Road, Bangalore 560068",
            "company_about": "Flipkart is India's leading e-commerce marketplace with 500 million registered users. Flipkart is owned by Walmart and is one of India's most innovative tech companies.",
            "job_description": "As a Full Stack Developer at Flipkart, you will own features end-to-end from database design to frontend components.",
            "responsibilities": "Build full-stack features using Python/Node backend and React frontend|Design and optimize database schemas|Create RESTful APIs|Work on high-traffic systems that serve millions of users",
            "qualifications": "2-4 years of full-stack development experience|Proficiency in Python or Node.js|Strong React.js skills|Good SQL knowledge",
            "interview_steps": "Walk-in Registration|Online Assessment|Backend Technical Round|Frontend Technical Round|System Design|HR Discussion"
        },
        {
            "company": "Wipro", "role": "C++ Developer",
            "skills_required": "C++,DSA,Python,Linux",
            "location": "Noida", "date": d(0),
            "walkin_time": "10:00 AM – 4:00 PM", "avg_salary": "5-9 LPA",
            "location_url": "https://maps.app.goo.gl/example5",
            "location_desc": "Wipro Limited, A-125, Sector 2, Noida, Uttar Pradesh 201301",
            "company_about": "Wipro Limited is a leading global technology services and consulting company with over 240,000 employees across 66 countries.",
            "job_description": "We are seeking a C++ Developer to work on high-performance systems and low-level components.",
            "responsibilities": "Develop and maintain high-performance C++ applications|Work on system-level programming|Implement data structures and algorithms|Debug and profile applications on Linux",
            "qualifications": "Bachelor's degree in CS or Electronics|1-3 years of C++ development experience|Strong knowledge of DSA|Experience with Linux",
            "interview_steps": "Walk-in Registration|Written Test - C++ & DSA|Technical Interview|Problem Solving Round|HR Round"
        },
        {
            "company": "Zomato", "role": "Data Analyst",
            "skills_required": "Python,SQL,Excel,PowerBI",
            "location": "Gurgaon", "date": d(4),
            "walkin_time": "11:00 AM – 4:00 PM", "avg_salary": "10-15 LPA",
            "location_url": "https://maps.app.goo.gl/example6",
            "location_desc": "Zomato Media Pvt. Ltd., 12th Floor, Tower D, DLF Cyber City, Phase II, Sector 24, Gurugram, Haryana 122022",
            "company_about": "Zomato is India's leading food delivery and restaurant discovery platform operating in 1000+ cities.",
            "job_description": "As a Data Analyst at Zomato, you will turn raw data into actionable insights that drive business decisions.",
            "responsibilities": "Analyse large datasets using Python and SQL|Build interactive dashboards in PowerBI|Work with product teams on key metrics|Conduct A/B test analysis",
            "qualifications": "1-3 years of data analysis experience|Strong SQL skills|Proficiency in Python|Experience with PowerBI or Tableau",
            "interview_steps": "Walk-in Registration|SQL & Analytics Test|Case Study|Technical Round|HR Discussion"
        },
        {
            "company": "Swiggy", "role": "React Developer",
            "skills_required": "React,HTML,CSS,JavaScript,Redux",
            "location": "Bangalore", "date": d(5),
            "walkin_time": "10:00 AM – 3:00 PM", "avg_salary": "12-18 LPA",
            "location_url": "https://maps.app.goo.gl/example7",
            "location_desc": "Bundl Technologies Pvt. Ltd. (Swiggy), Embassy Tech Village, Outer Ring Road, Bellandur, Bangalore 560103",
            "company_about": "Swiggy is India's leading on-demand delivery platform serving food, groceries, and more in 500+ cities.",
            "job_description": "We are looking for a React Developer to build fast and scalable web applications serving millions of hungry users.",
            "responsibilities": "Build and maintain React.js web applications|Implement complex UI features with Redux|Optimize web app performance|Write unit tests",
            "qualifications": "2+ years of React.js development experience|Strong JavaScript fundamentals|Experience with Redux|Proficiency in HTML5 and CSS3",
            "interview_steps": "Walk-in Registration|React.js Coding Challenge|Technical Interview|HR Round"
        },
        {
            "company": "Razorpay", "role": "Full Stack Engineer",
            "skills_required": "Python,React,SQL,HTML,Node",
            "location": "Bangalore", "date": d(7),
            "walkin_time": "10:00 AM – 5:00 PM", "avg_salary": "18-26 LPA",
            "location_url": "https://maps.app.goo.gl/example8",
            "location_desc": "Razorpay Software Pvt. Ltd., SJR Cyber, 22, Laskar Hosur Road, Adugodi, Bangalore 560030",
            "company_about": "Razorpay is India's leading full-stack financial solutions company processing billions of dollars in payments annually.",
            "job_description": "As a Full Stack Engineer at Razorpay, you will build the payment infrastructure that powers India's economy.",
            "responsibilities": "Build full-stack payment features|Design secure payment APIs|Work on high-availability systems|Implement fraud detection",
            "qualifications": "3+ years of full-stack development experience|Strong Python or Node.js backend skills|Proficient in React.js|Security-conscious mindset",
            "interview_steps": "Walk-in Registration|Technical Screening|Backend System Design|Frontend React Round|Security Discussion|HR & Compensation"
        },
        {
            "company": "Infosys", "role": "Java Developer",
            "skills_required": "Java,Spring,SQL,Hibernate",
            "location": "Chennai", "date": d(3),
            "walkin_time": "10:00 AM – 4:00 PM", "avg_salary": "6-10 LPA",
            "location_url": "https://maps.app.goo.gl/example9",
            "location_desc": "Infosys Ltd., Mahindra City, Chengalpattu District, Chennai, Tamil Nadu 603002",
            "company_about": "Infosys is a global leader in technology services with 340,000+ employees across 50 countries.",
            "job_description": "We are looking for a Java Developer to build enterprise-grade applications for our global clients.",
            "responsibilities": "Develop enterprise Java applications using Spring and Hibernate|Write clean, well-documented code|Design RESTful web services|Optimize SQL queries",
            "qualifications": "B.E/B.Tech/MCA in CS or related field|1-3 years of Java experience|Knowledge of Spring Framework and Hibernate|Good SQL concepts",
            "interview_steps": "Walk-in Registration|Written Test|Technical Interview Round 1|Technical Interview Round 2|HR Round|Offer Discussion"
        },
        {
            "company": "TCS", "role": "SQL Developer",
            "skills_required": "SQL,Python,Excel,Tableau",
            "location": "Mumbai", "date": d(3),
            "walkin_time": "9:00 AM – 2:00 PM", "avg_salary": "5-8 LPA",
            "location_url": "https://maps.app.goo.gl/example10",
            "location_desc": "Tata Consultancy Services, TCS House, Raveline Street, Fort, Mumbai, Maharashtra 400001",
            "company_about": "TCS is one of the largest IT companies in India with 600,000+ employees serving clients in 46 countries.",
            "job_description": "As a SQL Developer at TCS, you will design and optimize database schemas and support data analytics for enterprise clients.",
            "responsibilities": "Write complex SQL queries for data extraction|Design and optimize database schemas|Build data pipelines and ETL processes|Create Tableau reports",
            "qualifications": "1-2 years of SQL development experience|Strong SQL skills including joins, subqueries, window functions|Proficiency in Excel|Experience with Tableau",
            "interview_steps": "Walk-in Registration|SQL Written Test|Technical Interview|Tableau Assessment|HR Discussion"
        },
        {
            "company": "Ola", "role": "Android Developer",
            "skills_required": "Java,Android,SQL,Kotlin",
            "location": "Bangalore", "date": d(5),
            "walkin_time": "9:30 AM – 3:30 PM", "avg_salary": "10-16 LPA",
            "location_url": "https://maps.app.goo.gl/example11",
            "location_desc": "ANI Technologies Pvt. Ltd. (Ola), Regent Insignia, 3rd Floor, #414, 4th Cross, Sadashivanagar, Bangalore 560080",
            "company_about": "Ola is India's largest ride-hailing platform operating in 250+ cities with millions of daily active users.",
            "job_description": "As an Android Developer at Ola, you will build and maintain our Android application serving millions of daily active users.",
            "responsibilities": "Develop and maintain Ola's Android application in Kotlin/Java|Build smooth, responsive UI components|Integrate with backend REST APIs|Optimize app performance",
            "qualifications": "2+ years of Android development experience|Proficiency in Kotlin and Java|Experience with Android SDK and Jetpack|Good understanding of REST APIs",
            "interview_steps": "Walk-in Registration|Android Coding Test|Technical Round|App Architecture Discussion|HR Round"
        },
        {
            "company": "Paytm", "role": "Backend Developer",
            "skills_required": "Java,Spring,SQL,Python,Redis",
            "location": "Noida", "date": d(6),
            "walkin_time": "10:00 AM – 4:00 PM", "avg_salary": "12-18 LPA",
            "location_url": "https://maps.app.goo.gl/example12",
            "location_desc": "One97 Communications Ltd. (Paytm), B-121, Sector 5, Noida, Uttar Pradesh 201301",
            "company_about": "Paytm is India's leading digital payments company with 350 million+ registered users processing billions of transactions annually.",
            "job_description": "As a Backend Developer at Paytm, you will build the payment infrastructure serving hundreds of millions of Indians.",
            "responsibilities": "Build scalable backend services using Java Spring Boot|Design APIs for payment processing|Implement caching with Redis|Optimize SQL for high-traffic scenarios",
            "qualifications": "2-4 years of backend development experience|Strong Java and Spring Boot skills|Experience with Redis|Good SQL optimization skills",
            "interview_steps": "Walk-in Registration|Technical Screening|Core Java & Spring Round|System Design|Security Round|HR Discussion"
        },
        {
            "company": "HDFC Bank", "role": "Software Engineer",
            "skills_required": "Java,SQL,Python,Spring",
            "location": "Mumbai", "date": d(6),
            "walkin_time": "9:00 AM – 1:00 PM", "avg_salary": "8-12 LPA",
            "location_url": "https://maps.app.goo.gl/example13",
            "location_desc": "HDFC Bank Ltd., HDFC Bank House, Senapati Bapat Marg, Lower Parel, Mumbai, Maharashtra 400013",
            "company_about": "HDFC Bank is India's largest private sector bank with 8,000+ branches and 60 million+ customers.",
            "job_description": "As a Software Engineer at HDFC Bank, you will build robust banking software solutions used by millions of customers.",
            "responsibilities": "Develop banking applications using Java and Spring|Build secure APIs for digital banking|Work on core banking system integration|Ensure compliance with banking regulations",
            "qualifications": "B.E/B.Tech in CS or related field|2+ years of Java experience|Knowledge of Spring Framework|Strong SQL skills",
            "interview_steps": "Walk-in Registration|Aptitude Test|Technical Interview|SQL & Database Round|HR & Background Verification"
        },
        {
            "company": "PhonePe", "role": "Data Engineer",
            "skills_required": "Python,SQL,Spark,Kafka",
            "location": "Bangalore", "date": d(7),
            "walkin_time": "9:30 AM – 3:30 PM", "avg_salary": "16-24 LPA",
            "location_url": "https://maps.app.goo.gl/example14",
            "location_desc": "PhonePe Private Limited, Indiqube Margosa, 3rd Floor, Outer Ring Road, Bellandur, Bangalore 560103",
            "company_about": "PhonePe is India's leading fintech platform with 500 million+ registered users processing billions of UPI transactions monthly.",
            "job_description": "We are hiring a Data Engineer to build and maintain our massive data pipelines at billions of events scale.",
            "responsibilities": "Build and maintain large-scale data pipelines using Apache Spark|Design Kafka-based real-time data streaming|Write optimized SQL for data transformation|Monitor data quality",
            "qualifications": "2-4 years of data engineering experience|Strong Python skills|Experience with Apache Spark|Knowledge of Kafka for real-time streaming",
            "interview_steps": "Walk-in Registration|Data Engineering Assessment|Technical Round - Spark & Kafka|System Design|HR Discussion"
        },
        {
            "company": "BYJU'S", "role": "Frontend Engineer",
            "skills_required": "HTML,CSS,JavaScript,React,TypeScript",
            "location": "Bangalore", "date": d(1),
            "walkin_time": "10:00 AM – 4:00 PM", "avg_salary": "10-15 LPA",
            "location_url": "https://maps.app.goo.gl/example15",
            "location_desc": "Think & Learn Pvt. Ltd. (BYJU'S), IBC Knowledge Park, 4/1, Bannerghatta Main Road, Bangalore 560029",
            "company_about": "BYJU'S is the world's largest edtech company with 150 million+ students building engaging learning experiences through technology.",
            "job_description": "We are looking for a Frontend Engineer to build engaging, interactive learning experiences for millions of students.",
            "responsibilities": "Build interactive learning components using React and TypeScript|Implement engaging animations|Ensure accessibility and performance|Optimize for mobile and low-bandwidth",
            "qualifications": "2+ years of frontend development experience|Proficiency in React.js and TypeScript|Strong HTML5 and CSS3 skills|Passion for education technology",
            "interview_steps": "Walk-in Registration|Frontend Coding Assessment|Technical Round|UI/UX Problem Solving|HR Discussion"
        },
        {
            "company": "Freshworks", "role": "Python Engineer",
            "skills_required": "Python,Django,SQL,REST,Docker",
            "location": "Chennai", "date": d(2),
            "walkin_time": "9:00 AM – 3:00 PM", "avg_salary": "12-18 LPA",
            "location_url": "https://maps.app.goo.gl/example16",
            "location_desc": "Freshworks Inc., Olympia Technology Park, 370 Anna Salai, Nandanam, Chennai, Tamil Nadu 600035",
            "company_about": "Freshworks is a global SaaS company listed on NASDAQ building customer engagement software used by 68,000+ businesses worldwide.",
            "job_description": "We are looking for a Python Engineer to build the backend services that power our SaaS platform.",
            "responsibilities": "Build scalable REST APIs using Python and Django|Design and optimize SQL database schemas|Containerize applications using Docker|Write unit and integration tests",
            "qualifications": "2-3 years of Python development experience|Strong Django and REST framework knowledge|Good SQL skills|Experience with Docker",
            "interview_steps": "Walk-in Registration|Python Coding Test|Technical Round|Docker & DevOps Discussion|HR Round"
        },
        {
            "company": "Meesho", "role": "Java Microservices",
            "skills_required": "Java,Spring,SQL,Docker,Kubernetes",
            "location": "Bangalore", "date": d(3),
            "walkin_time": "10:00 AM – 4:00 PM", "avg_salary": "14-20 LPA",
            "location_url": "https://maps.app.goo.gl/example17",
            "location_desc": "Fashnear Technologies Pvt. Ltd. (Meesho), Meesho HQ, No. 165/1, 7th Cross Road, Domlur Layout, Bangalore 560071",
            "company_about": "Meesho is India's fastest-growing e-commerce platform serving 140 million+ users backed by SoftBank and Meta.",
            "job_description": "Join Meesho to build the microservices architecture that powers India's next e-commerce wave.",
            "responsibilities": "Design and build Java Spring Boot microservices|Deploy and manage services on Kubernetes|Containerize applications using Docker|Design APIs for seller features",
            "qualifications": "2-4 years of Java microservices experience|Strong Spring Boot knowledge|Experience with Docker and Kubernetes|Good SQL skills",
            "interview_steps": "Walk-in Registration|Java & Microservices Test|Technical Round|Kubernetes & Docker Round|System Design|HR Round"
        },
        {
            "company": "Nykaa", "role": "Web Developer",
            "skills_required": "HTML,CSS,JavaScript,React,Redux",
            "location": "Mumbai", "date": d(4),
            "walkin_time": "11:00 AM – 4:00 PM", "avg_salary": "8-14 LPA",
            "location_url": "https://maps.app.goo.gl/example18",
            "location_desc": "FSN E-Commerce Ventures Ltd. (Nykaa), 104, Vasan Udyog Bhavan, Sun Mill Compound, Lower Parel, Mumbai 400013",
            "company_about": "Nykaa is India's leading beauty and lifestyle e-commerce platform with 35 million+ monthly active users, listed on BSE and NSE.",
            "job_description": "We are looking for a Web Developer to build Nykaa's beautiful, high-performance e-commerce web experience.",
            "responsibilities": "Build and maintain Nykaa's React.js e-commerce web app|Implement product pages, cart, and checkout flows|Manage application state using Redux|Optimize page load performance",
            "qualifications": "2+ years of React.js development experience|Strong HTML5, CSS3, and JavaScript skills|Experience with Redux|Eye for design",
            "interview_steps": "Walk-in Registration|Frontend Assessment|React & Redux Technical Round|E-commerce UI Discussion|HR Round"
        },
        {
            "company": "Dream11", "role": "Backend Developer",
            "skills_required": "Python,Go,SQL,Redis,Kafka",
            "location": "Mumbai", "date": d(5),
            "walkin_time": "10:00 AM – 3:00 PM", "avg_salary": "16-22 LPA",
            "location_url": "https://maps.app.goo.gl/example19",
            "location_desc": "Dream Sports Inc. (Dream11), One World Centre, Tower 1B, 841, Senapati Bapat Marg, Lower Parel, Mumbai 400013",
            "company_about": "Dream11 is India's largest sports gaming platform with 220 million+ users handling 100 million+ concurrent users during IPL.",
            "job_description": "Join Dream11 to solve some of the hardest scale problems in India — systems serving 100M+ concurrent users.",
            "responsibilities": "Build high-performance backend APIs using Python and Go|Design real-time data processing using Kafka|Implement caching with Redis for peak load|Build contest scoring engines",
            "qualifications": "3+ years of backend development experience|Proficiency in Python and/or Go|Experience with Redis and Kafka|Strong SQL optimization skills",
            "interview_steps": "Walk-in Registration|DSA & System Design Test|Backend Technical Round|Redis & Kafka Architecture|Scale & Performance Discussion|HR Round"
        },
        {
            "company": "Zerodha", "role": "Software Engineer",
            "skills_required": "Python,SQL,JavaScript,React,Linux",
            "location": "Bangalore", "date": d(6),
            "walkin_time": "9:30 AM – 2:30 PM", "avg_salary": "14-20 LPA",
            "location_url": "https://maps.app.goo.gl/example20",
            "location_desc": "Zerodha Broking Ltd., #153/154, 4th Cross, J.P. Nagar 4th Phase, Bangalore, Karnataka 560078",
            "company_about": "Zerodha is India's largest stockbroker with 10 million+ active clients, bootstrapped and profitable, known for its engineering culture.",
            "job_description": "At Zerodha, you will build the trading infrastructure that millions of investors rely on every day.",
            "responsibilities": "Build trading platform features using Python and React|Design and optimize SQL databases for financial data|Work on Linux-based backend systems|Build APIs for trading and portfolio features",
            "qualifications": "2-4 years of software development experience|Strong Python skills|Good React.js for frontend|SQL expertise for financial data|Linux system knowledge",
            "interview_steps": "Walk-in Registration|Technical Assessment|Backend Technical Round|Frontend React Round|Culture & Values Discussion|Offer Letter"
        },
    ]

    for job in jobs:
        conn.execute("""
            INSERT INTO jobs (company, role, skills_required, location, location_url, location_desc,
                date, walkin_time, avg_salary, company_about, job_description,
                responsibilities, qualifications, interview_steps)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        """, (
            job["company"], job["role"], job["skills_required"],
            job["location"], job.get("location_url",""), job.get("location_desc",""),
            job["date"], job["walkin_time"], job["avg_salary"],
            job["company_about"], job["job_description"],
            job["responsibilities"], job["qualifications"], job["interview_steps"]
        ))

    conn.commit()
    print(f"✅ Seeded {len(jobs)} jobs with full descriptions.")
