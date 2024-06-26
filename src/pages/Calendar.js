import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Col, Row } from 'react-bootstrap';
import SideAd from '../images/side_ad.png';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ScheduleComponent, Inject, Day, Week, WorkWeek, Month, Agenda } from '@syncfusion/ej2-react-schedule';
import { format } from 'date-fns';

function Calendar() {
    const [events, setEvents] = React.useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get("http://localhost:3002/")
            .then(res => {
                console.log(res.data);
                if (res.data.valid) {
                    
                    sessionStorage.setItem('userId', res.data.id);
                    navigate('/calendar');
                } else {
                    navigate('/login');
                }
            })
            .catch(err => {
                console.log(err);
                navigate('/login');
            });
    }, [navigate]);

    const handleActionComplete = (args) => {
        if (args.requestType === 'eventCreated') {
            console.log("Event data received:", args);
            const eventData = args.data[0];
            const { Subject, Description, StartTime, EndTime, Location } = eventData;

           
            if (!Subject || !StartTime || !EndTime || !Location) {
                console.error("Incomplete event data:", eventData);
                return;
            }

           
            const formattedStartTime = format(new Date(StartTime), 'yyyy-MM-dd HH:mm:ss');
            const formattedEndTime = format(new Date(EndTime), 'yyyy-MM-dd HH:mm:ss');

            console.log("Event details to be sent:", {
                subject: Subject,
                description: Description,
                startTime: formattedStartTime,
                endTime: formattedEndTime,
                location: Location,
            });

            
            const userId = sessionStorage.getItem('userId');

            
            axios.post("http://localhost:3002/api/add-event", {
                userId: userId,
                title: Subject,
                description: Description,
                start: formattedStartTime,
                end: formattedEndTime,
                location: Location,
            })
            .then(res => {
                console.log("Event added successfully to the database:", res.data);
                fetchEvents(); 
            })
            .catch(err => {
                console.error("Error adding event to the database:", err);
            });
        }
    };

    const fetchEvents = () => {
        axios.get("http://localhost:3002/api/events")
            .then(res => {
                setEvents(res.data);
            })
            .catch(err => {
                console.error("Erreur lors de la récupération des événements :", err);
            });
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const data = events.map(event => ({
        Id: event.IDEVENT,
        Subject: event.TITRE,
        StartTime: new Date(event.DATE_DEBUT),
        EndTime: new Date(event.DATE_FIN),
        IsAllDay: false,
        Status: 'Completed',
        Priority: 'High'
    }));

    const fieldsData = {
        id: 'Id',
        subject: { name: 'Subject' },
        isAllDay: { name: 'IsAllDay' },
        startTime: { name: 'StartTime' },
        endTime: { name: 'EndTime' }
    };

    const eventSettings = { dataSource: data, fields: fieldsData };

    return (
        <div className='main-margin'>
            <Row className="calendar">
                <Col>
                    <h1>Calendrier de Béthel</h1>
                    <ScheduleComponent
                        width='80%'
                        height='700px'
                        className='scheduler'
                        eventSettings={eventSettings}
                        actionComplete={handleActionComplete}
                        firstDayOfWeek={1}
                    >
                        <Inject services={[Day, Week, Month, Agenda]} />
                    </ScheduleComponent>
                </Col>
                <Col xs lg="2">
                    <img className="image_side" src={SideAd} alt="sideimage"></img>
                </Col>
            </Row>
        </div>
    );
}

export default Calendar;
