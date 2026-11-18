import React, { useState } from 'react';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

function VoiceAssistant({ activeVehicleCount, damagedVehicleCount, avgBatteryLevel, activeDeliveriesCount }) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');

  const handleListen = () => {
    if (!recognition) return alert('Speech Recognition not supported');
    setListening(true);
    recognition.start();
    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      handleAIResponse(text);
    };
    recognition.onend = () => setListening(false);
  };

  const handleAIResponse = (text) => {
    let reply = "Sorry, I didn't understand.";
    const lower = text.toLowerCase();
    if (lower.includes('how many active vehicle')) {
      reply = `There are currently ${activeVehicleCount} active vehicles.`;
    } else if (lower.includes('how many active vehicles')) {
      reply = `There are currently ${activeVehicleCount} active vehicles.`;
    } else if ((lower.includes('damaged') && lower.includes('vehicle') && lower.includes('how many'))) {
      reply = `There are currently ${damagedVehicleCount} damaged vehicles.`;
    } else if ((lower.includes('average') || lower.includes('avg')) && lower.includes('battery')) {
      reply = avgBatteryLevel !== 'N/A' ? `The average battery level is ${avgBatteryLevel} percent.` : 'Battery data is not available.';
    } else if ((lower.includes('active') && lower.includes('deliver') && lower.includes('how many'))) {
      reply = `There are currently ${activeDeliveriesCount} active deliveries.`;
    } else if (lower.includes('delivery')) reply = 'You can view deliveries in the dashboard.';
    else if (lower.includes('hello i am devendra  ')) reply = 'Arey Devendra behen ke laude! Kaise ho be? Batao kya halchal hai teri zindagi mein? Tumhare bhi toh girlfriend hai na — Ishanvi? Waise ek baat bolu, usne tumhe kaise pasand kar li bhai, yeh toh science ka bhi level paar kar gaya! Tum jaise BSDK ko dekh kar bhi pyaar ho gaya... sach mein, ya toh pyaar andha hota hai, ya Ishanvi ke specs missing the uss din!';
    else if (lower.includes('vehicle')) reply = 'You can check vehicle status in the fleet section.';
    else if (lower.includes('maintenance')) reply = 'You can check maintenance status in the Predictive Maintenance section.';
    else if (lower.includes('damage')) reply = 'Damaged vehicles are shown in the Damaged Vehicles card.';
    else if (lower.includes('battery')) reply = 'Average battery level is displayed on the dashboard.';
    else if (lower.includes('speed')) reply = 'Average speed of vehicles is shown on the dashboard.';
    else if (lower.includes('alert')) reply = 'Recent alerts are shown at the top of the dashboard.';
    else if (lower.includes('dashboard')) reply = 'This is your main dashboard overview.';
    else if (lower.includes('fleet')) reply = 'Fleet status is available in the Fleet Status section.';
    else if (lower.includes('logout')) reply = 'You can log out using the profile menu at the top right.';
    else if (lower.includes('profile')) reply = 'You can view or edit your profile from the sidebar.';
    else if (lower.includes('help')) reply = 'For help, please refer to the help section or contact support.';
    setResponse(reply);
    const synth = window.speechSynthesis;
    const utter = new window.SpeechSynthesisUtterance(reply);
    synth.speak(utter);
  };

  return (
    <div style={{ position: 'fixed', bottom: 30, right: 30, zIndex: 9999, background: '#fff', padding: 16, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
      <button onClick={handleListen} disabled={listening} style={{ padding: '8px 16px', borderRadius: 4, background: '#1976d2', color: '#fff', border: 'none', cursor: 'pointer' }}>
        {listening ? 'Listening...' : 'Ask Assistant'}
      </button>
      {transcript && <div style={{ marginTop: 8 }}><b>You:</b> {transcript}</div>}
      {response && <div style={{ marginTop: 4 }}><b>Assistant:</b> {response}</div>}
    </div>
  );
}

export default VoiceAssistant; 