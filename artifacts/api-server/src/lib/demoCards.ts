import type { Persona } from "../data/personas";
import type { ActionCards } from "./gemma/schemas";

export function getDemoCards(persona: Persona, _alertText: string): ActionCards {
  const cards: Record<string, ActionCards> = {
    asha: {
      risk_summary:
        "Asha is on the ground floor, diabetic, and living alone. Floodwater rises fastest at ground level. Her medical condition makes delays dangerous. She must act immediately to stay safe indoors.",
      first_action:
        "Move to the highest safe indoor area now. Take insulin, phone, charger, ID, and water. Stay away from switches and floodwater.",
      why_this_action:
        "Because Asha is diabetic, alone, and on the ground floor, the system prioritizes vertical safety and medical continuity.",
      next_3_steps: [
        "Collect insulin, medicines, and blood sugar kit into one waterproof bag.",
        "Call a trusted neighbor or family member and tell them your location right now.",
        "Place a bright cloth at your window so rescue workers can identify you need help.",
      ],
      must_take: [
        "Insulin and medicines",
        "Phone and charger",
        "ID documents",
        "Drinking water",
      ],
      do_not_do: [
        "Do not enter or step into floodwater",
        "Do not skip insulin or medication",
        "Do not touch electrical switches if water is nearby",
        "Do not trust forwarded messages about route safety",
        "Do not wait until water enters to call for help",
      ],
      battery_saving_tip:
        "Lower screen brightness. Turn off mobile data between calls. Use airplane mode to preserve battery for emergencies.",
      rumor_safety_note:
        "Only trust official alerts from local government or NDMA. Do not act on forwarded messages claiming routes are safe — conditions change faster than messages travel.",
      sms_card:
        "ASHA, 68, DIABETIC, GROUND FLOOR, ALONE. Needs evacuation help. Insulin required. Location: [your address]. Please send assistance.",
      ivr_script:
        "Hindi: आशा जी, अभी ऊपर सुरक्षित जगह पर जाइए। इंसुलिन, फोन, चार्जर, पहचान पत्र और पानी साथ लीजिए। बिजली के स्विच और बाढ़ के पानी से दूर रहिए।\n\nRomanized: Asha ji, abhi upar surakshit jagah par jaiye. Insulin, phone, charger, ID aur paani saath lijiye. Bijli ke switch aur baadh ke paani se door rahiye.",
      whatsapp_family_card:
        "Family message:\nI am safe for now. I am at [address], ground floor, alone. I have my medicines. I am staying elevated inside. Please contact rescue services or come as soon as it is safe. I will check messages every hour. My phone battery is being conserved.",
      volunteer_rescue_card:
        "RESCUE PRIORITY — HIGH\nName: Asha | Age: 68 | Location: Ground Floor\nMedical: Diabetic — insulin required, do not delay\nMobility: Limited — needs physical assistance\nStatus: Living alone, elevated indoors\nAction: Bring stretcher or wheelchair assist. Confirm insulin supply before moving.",
      offline_checklist: [
        "Move to highest indoor point immediately",
        "Pack insulin and all medicines",
        "Fill containers with clean water",
        "Charge phone fully while power is available",
        "Place distress signal at window",
        "Inform one neighbor of your location",
        "Write emergency contacts on paper",
        "Switch off all electrical appliances",
        "Keep shoes on at all times",
      ],
      reasoning_summary:
        "Asha presents compounding vulnerabilities: ground floor (highest flood risk), diabetic (medication timing critical), living alone (no immediate support), limited mobility (requires external evacuation help). Priority sequence: (1) vertical elevation indoors, (2) secure medication, (3) establish communication, (4) signal for rescue. Outdoor movement without assistance is not recommended. Demo mode active.",
    },

    imran: {
      risk_summary:
        "Imran uses a wheelchair and cannot evacuate without trained assistance. While the first floor provides time, delay in contacting rescue services reduces the window for safe evacuation.",
      first_action:
        "Do not attempt stairs alone. Call emergency help or a trusted contact now. Send a rescue handoff card and conserve battery.",
      why_this_action:
        "Because Imran uses a wheelchair and cannot evacuate independently, assisted evacuation is safer than self-evacuation.",
      next_3_steps: [
        "Call the emergency helpline and state clearly: name, wheelchair user, exact address, floor number.",
        "Pack medicines, documents, and phone charger into a bag you can keep on your lap.",
        "Keep phone fully charged and volume at maximum. Stay near the door for quick rescue access.",
      ],
      must_take: [
        "Phone and charger",
        "ID documents",
        "Medicines",
        "Rescue contact information",
      ],
      do_not_do: [
        "Do not attempt stairs or ramps without trained help",
        "Do not wait silently — actively contact rescue services",
        "Do not move wheelchair into floodwater or waterlogged areas",
        "Do not follow unverified evacuation route information",
        "Do not disconnect from rescue services communication",
      ],
      battery_saving_tip:
        "Keep phone charging as long as power is available. Once power is off, disable Wi-Fi and data — turn them on only to send or receive rescue calls.",
      rumor_safety_note:
        "Rescue coordination happens through verified official channels only. Do not follow instructions from unknown callers or unverified social media posts.",
      sms_card:
        "URGENT — IMRAN, 35, WHEELCHAIR USER, FIRST FLOOR. Cannot evacuate alone. Needs trained rescue team. Location: [address]. Phone: [number]. Awaiting assistance.",
      ivr_script:
        "Hindi: इमरान जी, अकेले सीढ़ियाँ न उतरें। अभी आपातकालीन सेवा को फोन करें और बताएं — आप व्हीलचेयर पर हैं, पहली मंजिल पर हैं, और मदद की जरूरत है।\n\nRomanized: Imran ji, akele seedhiyan na utarein. Abhi emergency helpline ko call karein aur batayein — aap wheelchair par hain, pehli manzil par hain, aur madad chahiye.",
      whatsapp_family_card:
        "Family message:\nI am on the first floor and safe for now. I cannot evacuate without help. I have called the emergency helpline and told them I use a wheelchair. Please also call [helpline number] and confirm my rescue request. My address is [address]. I will keep my phone on. Please keep trying to reach me.",
      volunteer_rescue_card:
        "RESCUE PRIORITY — HIGH — MOBILITY EQUIPMENT REQUIRED\nName: Imran | Age: 35 | Location: First Floor\nMobility: Full-time wheelchair user — cannot use stairs independently\nEquipment: Evacuation chair or stretcher + minimum 2-person assist\nMedical: Confirm medications on exit\nNote: First floor provides time but advance coordination is essential.",
      offline_checklist: [
        "Call emergency helpline immediately",
        "Text address and wheelchair status to 3 family members",
        "Pack medicines and documents into lap bag",
        "Keep phone charged and volume on maximum",
        "Unlock front door for rescue team access",
        "Place bright cloth or light at window",
        "Stay away from windows and electrical outlets",
      ],
      reasoning_summary:
        "Imran's primary vulnerability is mobility dependency — evacuation is impossible without external assistance and appropriate equipment. First-floor placement provides a time advantage, but this window is wasted if rescue coordination is delayed. Critical intervention: contact emergency services early enough for them to organize wheelchair evacuation equipment and personnel. Demo mode active.",
    },

    meena: {
      risk_summary:
        "Water is outside but has not entered Meena's home. She has two children and a narrow window to prepare calmly. Staying indoors and preparing carefully is safer than unplanned movement.",
      first_action:
        "Keep children indoors. Pack child medicine, IDs, water, and phone charger. Do not step into floodwater. Wait for official evacuation instructions.",
      why_this_action:
        "Because water is outside but not yet inside, the safest action is calm preparation, child safety, and avoiding panic travel.",
      next_3_steps: [
        "Pack one bag: children's medicines, water, biscuits, ID documents, and phone charger.",
        "Dress both children in bright-colored clothing. Keep them close and calm.",
        "Tell one neighbor your situation and listen only to official evacuation announcements.",
      ],
      must_take: [
        "Children's medicines",
        "ID documents",
        "Drinking water",
        "Phone and charger",
        "Simple food",
      ],
      do_not_do: [
        "Do not let children near floodwater",
        "Do not step outside to assess water depth",
        "Do not travel without official evacuation instruction",
        "Do not separate from children for any reason",
        "Do not use electricity or gas if water approaches the home",
      ],
      battery_saving_tip:
        "Turn off background apps and set low battery mode now. Text family updates instead of calling to save battery. Keep a power bank charged if available.",
      rumor_safety_note:
        "Only trust evacuation instructions from officials. Forwarded messages about safe routes are often outdated. Conditions change faster than messages. Trust official announcements only.",
      sms_card:
        "MEENA + 2 CHILDREN. Ground floor, water outside. Staying indoors, prepared to evacuate on official instruction. Location: [address]. Contact: [number].",
      ivr_script:
        "Hindi: मीना जी, बच्चों को घर के अंदर रखें। दवाई, पहचान पत्र, पानी और फोन चार्जर तैयार रखें। बाढ़ के पानी में न जाएं। सरकारी निर्देश का इंतज़ार करें।\n\nRomanized: Meena ji, bachon ko ghar ke andar rakhein. Dawaai, ID, paani aur phone charger taiyaar rakhein. Baadh ke paani mein na jayein. Sarkari nirdesh ka intezaar karein.",
      whatsapp_family_card:
        "Family message:\nI am safe with the children at home. Water is outside but not inside yet. We are prepared with medicines, water, and documents. I am waiting for official evacuation instructions before moving. I will send an update every hour. If you do not hear from me in 2 hours, please contact [local helpline].",
      volunteer_rescue_card:
        "FAMILY SHELTERING IN PLACE\nName: Meena | Age: 30 | With: 2 young children\nStatus: Ground floor — water outside, not yet inside\nPlan: Awaiting official evacuation order\nNote: Family has supplies and is monitoring. Check welfare if no confirmation in 2 hours. Address: [address].",
      offline_checklist: [
        "Keep children indoors and calm",
        "Pack one bag: medicines, water, snacks, documents",
        "Dress children in bright visible clothing",
        "Turn off gas and electricity at main switch",
        "Tell a neighbor your situation",
        "Do not go outside until official instruction",
        "Send location update to family",
        "Keep phone on loud and charged",
      ],
      reasoning_summary:
        "Meena's situation is a shelter-and-prepare scenario: water is outside but not inside, giving her preparation time. With two children, unplanned movement is more dangerous than calm indoor preparation. The recommended action is: stay indoors, prepare supplies, and wait for official evacuation instructions. Moving without official guidance increases risk for the children. Demo mode active.",
    },
  };

  return cards[persona.id] ?? cards["asha"]!;
}
