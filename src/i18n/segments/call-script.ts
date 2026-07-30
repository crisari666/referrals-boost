export const callScriptSegment = {
  es: {
    title: 'Guión primera llamada',
    goldenRule: 'Sé el tráiler, no la película. Objetivo: agendar la videollamada.',
    stagesLabel: 'Fases',
    objectionsLabel: 'Objeciones',
    pillsLabel: 'Píldora del proyecto',
    suggestedReplies: 'Qué decir',
    sayNowLabel: 'Di ahora',
    tipLabel: 'Tip',
    aiCoachLabel: 'Asistente IA',
    aiListening: 'IA escuchando',
    liveBadge: 'En vivo',
    confidenceLabel: 'Confianza',
    transcriptLabel: 'Transcripción en vivo',
    transcriptEmpty: 'Escuchando la llamada…',
    selectObjectionHint: 'Toca una objeción o espera la sugerencia automática.',
    autoSuggestion: 'Sugerencia automática',
    speakerAgent: 'Asesor',
    speakerCustomer: 'Cliente',
    speakerUnknown: 'Habla',
    callEndedTitle: 'Conversación finalizada',
    callEndedHint: 'Revisa el guión y la transcripción de la llamada.',
    transcriptEnded: 'Llamada terminada',
    ventorSpeaking: 'Asesor hablando',
    muteMic: 'Silenciar mic',
    unmuteMic: 'Activar mic',
    projectBranchesLabel: 'Proyectos (Fase 4)',
    stages: {
      apertura: {
        title: '1. Apertura',
        prompt:
          '[Nombre], ¡hola! ¿Cómo estás? Te habla [Tu nombre], de parte del Holding Inmobiliario La Ceiba. Te cuento: en nuestra base de datos me registra que estás interesado/a en los lotes campestres que comercializamos en Carmen de Apicalá [o: en nuestro proyecto de playa en Cartagena]. ¿Esta información es correcta?',
        tip: 'Si no recuerda: «No hay problema, seguramente lo viste en redes hace unos días — te refresco en 20 segundos de qué se trata» y continúas.',
      },
      acuerdo_previo: {
        title: '2. Acuerdo previo',
        prompt:
          'Perfecto, [Nombre]. Mira, el objetivo de esta llamada es contarte muy brevemente de qué se trata el proyecto y hacerte un par de preguntas para asesorarte bien. Pero la idea real es que agendemos una videollamada corta donde te muestro todo a detalle — planos, lotes disponibles, financiación — para que tengas claridad total. Y si te llega a interesar, coordinamos una visita al terreno. ¿Te parece bien que lo hagamos así?',
        tip: 'El cliente acepta por adelantado: llamada → videollamada → visita. Segundo «sí» de la llamada.',
      },
      diagnostico: {
        title: '3. Diagnóstico',
        prompt1:
          'Antes de contarte, quiero hacerte dos preguntas para brindarte la asesoría de la manera correcta. La primera: ¿lo que buscas es para construir una casa de descanso, o es más un tema de inversión?',
        prompt2:
          'Y la segunda: ¿más o menos qué presupuesto tienes destinado para esta inversión? Por ejemplo, ¿estás pensando en algo entre 40 y 50 millones, más, menos? ¿Y lo harías de contado o te interesa la financiación directa?',
        tip: 'Si dice ambas: «Excelente, porque estos proyectos funcionan justo para eso: disfrutas hoy y se valoriza mañana.»',
      },
      pildora: {
        title: '4. Píldora',
        prompt:
          'Elige el proyecto hijo de la pauta y dale el tráiler corto. No es un catálogo: cada píldora termina sembrando la videollamada. Luego continúa a Cierre agenda.',
        tip: 'Los 4 proyectos hijos: Valle del Sol, Villas del Olimpo, Parque del Agua y Riviera. Solo si pide opciones o la pauta era genérica, usa el barrido de portafolio.',
      },
      cierre_agenda: {
        title: '5. Cierre agenda',
        prompt1:
          '[Nombre], con base en lo que me cuentas, esto encaja muy bien contigo. Hagamos la videollamada hoy mismo: yo puedo a las 4 de la tarde, ¿te parece bien?',
        prompt2:
          'No hay problema. ¿Te queda mejor mañana en la mañana o en la tarde? … Perfecto. ¿A las 3 te parece bien, o mejor a las 5?',
        tip: 'Nunca preguntes «¿cuándo puedes?». Hora específica → franja → hora. Nunca cuelgues sin fecha y hora.',
      },
      confirmacion_wa: {
        title: '6. Confirmación WA',
        prompt1:
          '[Nombre], ¡un gusto hablar contigo! Quedamos confirmados para [día] a las [hora]. Aquí te dejo el link de la videollamada y un video corto del proyecto. ¡Nos vemos!',
        prompt2:
          'Audio personal la noche anterior o 3 h antes: «[Nombre], te confirmo nuestra videollamada de hoy a las [hora]. Te tengo listo el plano con los lotes en tu presupuesto.»',
        prompt3:
          'Si no se conecta (5 min): «[Nombre], ya estoy en la videollamada, ¿te conectas o te reagendo? ¿Hoy más tarde o mañana?» Máximo 2 reagendas.',
      },
    },
    pills: {
      barrido_portafolio: {
        label: 'Barrido portafolio',
        reply:
          'Te cuento rapidito: en Carmen de Apicalá manejamos tres proyectos. Valle del Sol, lotes campestres desde 300 m² y desde $51 millones. Villas del Olimpo, nuestro condominio campestre más exclusivo, desde 300 m² y desde $61 millones. Y Parque del Agua, tipo urbanización, lotes desde 72 m² y desde $37 millones — sin administración y 100% construible. Todos con financiación directa hasta 36 meses sin intereses. Según lo que me cuentas, el que más se ajusta a ti es [proyecto]. ¿Quieres que en la videollamada nos enfoquemos en ese, o te muestro los tres?',
      },
      valle_del_sol: {
        label: 'Valle del Sol',
        reply:
          'Es nuestro proyecto más campestre: lotes desde 300 m² y desde $51 millones, financiado directo hasta 36 meses sin intereses. Tiene piscina tipo playa, club house, zonas de aventura, senderismo, lagos… es desconexión total a 25 minutos del pueblo. En la videollamada te muestro el plano y los lotes disponibles.',
      },
      villas_del_olimpo: {
        label: 'Villas del Olimpo',
        reply:
          'Es nuestro condominio campestre más exclusivo, a solo 3 km del parque central. Lotes desde 300 m² y desde $61 millones, construcción estilo mediterráneo. Tiene piscina Cataratas Victoria, aquapark infantil, canchas de tenis y pádel… La valorización proyectada supera ampliamente un CDT. En la videollamada te muestro todo con renders.',
      },
      parque_del_agua: {
        label: 'Parque del Agua',
        reply:
          'Es nuestra urbanización a 9 cuadras del centro, con un concepto de libertad total: sin administración, sin restricciones de diseño y 100% construible. Lotes desde 72 m² y desde $37 millones — separas con $1 millón y financias 36 meses sin intereses. En la videollamada te muestro el plano y cómo funciona.',
      },
      riviera_beach_house: {
        label: 'Riviera Beach House',
        reply:
          'Es nuestro proyecto de lujo en la zona norte de Cartagena, la zona de mayor crecimiento inmobiliario del país. Lotes desde 200 m² desde $129.9 millones, con club de playa propio, spa, canchas y normativa turística — ideal para renta corta. Separas con $2 millones y financias 36 meses sin intereses. En la videollamada te muestro todo a detalle.',
      },
    },
    objections: {
      no_recuerda: {
        label: 'No recuerda',
        reply1:
          'No hay problema, seguramente lo viste en redes hace unos días — te refresco en 20 segundos de qué se trata.',
      },
      no_da_presupuesto: {
        label: 'No da presupuesto',
        reply1:
          'Tranquilo/a, te lo pregunto solo para mostrarte las opciones que sí se ajustan y no hacerte perder tiempo.',
      },
      no_tengo_tiempo: {
        label: 'No tengo tiempo',
        reply1:
          'Te entiendo perfectamente. Aprovechemos estos 5 minutos que tienes: te envío el link ya mismo, te muestro lo más importante y quedas con una imagen clara. ¿Listo?',
        reply2:
          'Si no acepta: agenda con doble alternativa para mañana (mañana/tarde → hora).',
      },
      enviame_info: {
        label: 'Envíame la info',
        reply1:
          '¡Claro que sí! Te envío ahora un audio corto y unos videos del proyecto. Y para resolver tus preguntas puntuales, dejemos de una vez la videollamada: ¿mañana en la mañana o en la tarde?',
        reply2:
          'Envías: (1) audio 40–60 seg, (2) copy del proyecto, (3) videos del Drive. NUNCA brochure ni plan de pagos antes de la videollamada.',
      },
      hablo_con_pareja: {
        label: 'Hablo con pareja',
        reply1:
          '¡Excelente! Precisamente por eso la videollamada es perfecta: se conectan los dos y les muestro todo al tiempo, así deciden con la misma información. ¿Qué horario les sirve a ambos?',
      },
      dime_el_precio: {
        label: '¿Cuánto vale?',
        reply1:
          'Los lotes van desde $[X] millones, pero el valor exacto depende del lote, la ubicación dentro del proyecto y el plan de pagos que elijas. Justo eso te lo muestro en el plano en la videollamada, para que elijas con datos reales.',
      },
      hoy_esa_hora_no: {
        label: 'Hoy a esa hora no',
        reply1: 'No hay problema. ¿Te queda mejor mañana en la mañana o en la tarde?',
        reply2: 'Perfecto. ¿A las 3 te parece bien, o mejor a las 5?',
      },
    },
  },
  en: {
    title: 'First-call script',
    goldenRule: 'Be the trailer, not the movie. Goal: book the video call.',
    stagesLabel: 'Stages',
    objectionsLabel: 'Objections',
    pillsLabel: 'Project pitch',
    suggestedReplies: 'What to say',
    sayNowLabel: 'Say now',
    tipLabel: 'Tip',
    aiCoachLabel: 'AI coach',
    aiListening: 'AI listening',
    liveBadge: 'Live',
    confidenceLabel: 'Confidence',
    transcriptLabel: 'Live transcript',
    transcriptEmpty: 'Listening to the call…',
    selectObjectionHint: 'Tap an objection or wait for the automatic suggestion.',
    autoSuggestion: 'Automatic suggestion',
    speakerAgent: 'Agent',
    speakerCustomer: 'Customer',
    speakerUnknown: 'Speaker',
    callEndedTitle: 'Conversation ended',
    callEndedHint: 'Review the script guide and call transcript.',
    transcriptEnded: 'Call ended',
    ventorSpeaking: 'Agent speaking',
    muteMic: 'Mute mic',
    unmuteMic: 'Unmute mic',
    projectBranchesLabel: 'Projects (Phase 4)',
    stages: {
      apertura: {
        title: '1. Opening',
        prompt:
          '[Name], hi! How are you? This is [Your name], from Holding Inmobiliario La Ceiba. Our records show you are interested in the country lots we sell in Carmen de Apicalá [or: our beach project in Cartagena]. Is that correct?',
        tip: 'If they do not remember: «No problem — you likely saw it on social a few days ago. I will refresh you in 20 seconds» and continue.',
      },
      acuerdo_previo: {
        title: '2. Up-front contract',
        prompt:
          'Perfect, [Name]. The goal of this call is to briefly explain the project and ask a couple of questions so I can advise you well. The real idea is to book a short video call where I show everything in detail — floor plans, available lots, financing — so you have total clarity. And if it interests you, we coordinate a site visit. Does that work for you?',
        tip: 'They accept the path in advance: call → video → visit. Second «yes» of the call.',
      },
      diagnostico: {
        title: '3. Diagnosis',
        prompt1:
          'Before I share more, two questions so I can advise you correctly. First: are you looking to build a weekend home, or is it more of an investment?',
        prompt2:
          'And second: roughly what budget do you have for this investment? For example, between 40 and 50 million, more, less? Cash or direct financing?',
        tip: 'If both: «Excellent — these projects work for that: enjoy today and appreciate tomorrow.»',
      },
      pildora: {
        title: '4. Pitch',
        prompt:
          'Pick the campaign project child and give a short trailer. Not a catalog: every pitch ends by seeding the video call. Then continue to Book agenda.',
        tip: 'The 4 project children: Valle del Sol, Villas del Olimpo, Parque del Agua and Riviera. Only if they ask for options or the ad was generic, use the portfolio sweep.',
      },
      cierre_agenda: {
        title: '5. Book agenda',
        prompt1:
          '[Name], based on what you shared, this fits you well. Let’s do the video call today — I can do 4 pm, does that work?',
        prompt2:
          'No problem. Is tomorrow morning or afternoon better? … Perfect. 3 pm or 5 pm?',
        tip: 'Never ask «when can you?». Specific time → window → time. Never hang up without a date and time.',
      },
      confirmacion_wa: {
        title: '6. WA confirm',
        prompt1:
          '[Name], great talking with you! We are confirmed for [day] at [time]. Here is the video-call link and a short project video. See you!',
        prompt2:
          'Personal audio the night before or 3 h before: «[Name], confirming our video call today at [time]. I have the floor plan ready for lots in your budget.»',
        prompt3:
          'If they no-show (5 min): «[Name], I am already in the video call — join now or shall I reschedule? Later today or tomorrow?» Max 2 reschedules.',
      },
    },
    pills: {
      barrido_portafolio: {
        label: 'Portfolio sweep',
        reply:
          'Quick overview: in Carmen de Apicalá we have three projects. Valle del Sol, country lots from 300 m² from $51M. Villas del Olimpo, our most exclusive country condo, from 300 m² from $61M. And Parque del Agua, urbanization-style lots from 72 m² from $37M — no HOA and 100% buildable. All with direct financing up to 36 months interest-free. Based on what you shared, [project] fits you best. Want to focus on that in the video call, or see all three?',
      },
      valle_del_sol: {
        label: 'Valle del Sol',
        reply:
          'Our most countryside project: lots from 300 m² from $51M, direct financing up to 36 months interest-free. Beach-style pool, club house, adventure zones, hiking, lakes — total disconnect 25 minutes from town. On the video call I will show the floor plan and available lots.',
      },
      villas_del_olimpo: {
        label: 'Villas del Olimpo',
        reply:
          'Our most exclusive country condo, only 3 km from the central park. Lots from 300 m² from $61M, Mediterranean-style build. Victoria Falls pool, kids aquapark, tennis and padel… Projected appreciation beats a CDT. On the video call I will show everything with renders.',
      },
      parque_del_agua: {
        label: 'Parque del Agua',
        reply:
          'Our urbanization 9 blocks from downtown: total freedom — no HOA, no design restrictions, 100% buildable. Lots from 72 m² from $37M — reserve with $1M and finance 36 months interest-free. On the video call I will show the floor plan and how it works.',
      },
      riviera_beach_house: {
        label: 'Riviera Beach House',
        reply:
          'Our luxury project in north Cartagena, the country’s fastest-growing real-estate zone. Lots from 200 m² from $129.9M, private beach club, spa, courts, and tourism zoning — ideal for short-term rentals. Reserve with $2M and finance 36 months interest-free. On the video call I will show everything in detail.',
      },
    },
    objections: {
      no_recuerda: {
        label: 'Does not remember',
        reply1:
          'No problem — you likely saw it on social a few days ago. I will refresh you in 20 seconds on what this is about.',
      },
      no_da_presupuesto: {
        label: 'Won’t share budget',
        reply1:
          'No worries — I only ask so I can show options that fit and not waste your time.',
      },
      no_tengo_tiempo: {
        label: 'No time now',
        reply1:
          'I completely understand. Let’s use these 5 minutes: I will send the link now, show the essentials, and you leave with a clear picture. Ready?',
        reply2: 'If they decline: book tomorrow with a double alternative (morning/afternoon → time).',
      },
      enviame_info: {
        label: 'Just send info',
        reply1:
          'Of course! I will send a short audio and project videos now. And to answer your specific questions, let’s book the video call: tomorrow morning or afternoon?',
        reply2:
          'Send: (1) 40–60s audio, (2) project copy, (3) Drive videos. NEVER brochure or payment plan before the video call.',
      },
      hablo_con_pareja: {
        label: 'Talk to partner',
        reply1:
          'Excellent! That is exactly why the video call is perfect: you both join and I show everything at once so you decide with the same information. What time works for both of you?',
      },
      dime_el_precio: {
        label: 'What’s the price?',
        reply1:
          'Lots start from $[X] million, but the exact value depends on the lot, location inside the project, and the payment plan you choose. That is exactly what I show on the floor plan in the video call, so you choose with real data.',
      },
      hoy_esa_hora_no: {
        label: 'Not that time today',
        reply1: 'No problem. Is tomorrow morning or afternoon better?',
        reply2: 'Perfect. Does 3 pm work, or better 5 pm?',
      },
    },
  },
} as const;
