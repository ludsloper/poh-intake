export type FourDKLDimension = 'distress' | 'depressie' | 'angst' | 'somatisatie'

export type FourDKLItem = {
	 id: string
	 dim: FourDKLDimension
	 text: string
}

// Vervang de teksten hieronder met de officiële 4DKL items (50 items totaal)
// Verdeling: Distress(16), Depressie(6), Angst(12), Somatisatie(16)
export const FOUR_DKL_ITEMS: FourDKLItem[] = [
	// Somatisatie (1–16)
	{ id: '1', dim: 'somatisatie', text: 'Duizeligheid of een licht gevoel in het hoofd?' },
	{ id: '2', dim: 'somatisatie', text: 'Pijnlijke spieren?' },
	{ id: '3', dim: 'somatisatie', text: 'Flauw vallen?' },
	{ id: '4', dim: 'somatisatie', text: 'Pijn in de nek?' },
	{ id: '5', dim: 'somatisatie', text: 'Pijn in de rug?' },
	{ id: '6', dim: 'somatisatie', text: 'Overmatige transpiratie?' },
	{ id: '7', dim: 'somatisatie', text: 'Hartkloppingen?' },
	{ id: '8', dim: 'somatisatie', text: 'Hoofdpijn?' },
	{ id: '9', dim: 'somatisatie', text: 'Een opgeblazen gevoel in de buik?' },
	{ id: '10', dim: 'somatisatie', text: 'Wazig zien of vlekken voor de ogen zien?' },
	{ id: '11', dim: 'somatisatie', text: 'Benauwdheid?' },
	{ id: '12', dim: 'somatisatie', text: 'Misselijkheid of een maag die “van streek” is?' },
	{ id: '13', dim: 'somatisatie', text: 'Pijn in de buik of maagstreek?' },
	{ id: '14', dim: 'somatisatie', text: 'Tintelingen in de vingers?' },
	{ id: '15', dim: 'somatisatie', text: 'Een drukkend of beklemmend gevoel op de borst?' },
	{ id: '16', dim: 'somatisatie', text: 'Pijn in de borst?' },

	// Distress (16 items) – op basis van standaardverdeling
	{ id: '17', dim: 'distress', text: 'Neerslachtigheid?' },
	{ id: '19', dim: 'distress', text: 'Piekeren?' },
	{ id: '20', dim: 'distress', text: 'Onrustig slapen?' },
	{ id: '22', dim: 'distress', text: 'Lusteloosheid?' },
	{ id: '25', dim: 'distress', text: 'Voelde u zich gespannen?' },
	{ id: '26', dim: 'distress', text: 'Werd u snel geïrriteerd?' },
	{ id: '32', dim: 'distress', text: 'Dat u het niet meer aankunt?' },
	{ id: '35', dim: 'distress', text: 'Dat er geen uitweg is uit uw situatie?' },
	{ id: '36', dim: 'distress', text: 'Dat u er niet meer tegenop kunt?' },
	{ id: '37', dim: 'distress', text: 'Dat u nergens meer zin in hebt?' },
	{ id: '38', dim: 'distress', text: 'Moeite met helder denken?' },
	{ id: '39', dim: 'distress', text: 'Moeite om in slaap te komen?' },
	{ id: '41', dim: 'distress', text: 'Werd u snel emotioneel?' },
	{ id: '46', dim: 'distress', text: 'Dacht u weleens: “was ik maar dood”?' },
	{ id: '47', dim: 'distress', text: 'Schoten beelden in gedachten over aangrijpende gebeurtenissen?' },
	{ id: '48', dim: 'distress', text: 'Moest u gedachten aan aangrijpende gebeurtenissen actief wegduwen?' },

	// Depressie (6)
	{ id: '28', dim: 'depressie', text: 'Dat alles zinloos is?' },
	{ id: '29', dim: 'depressie', text: 'Dat u tot niets meer kunt komen?' },
	{ id: '30', dim: 'depressie', text: 'Dat het leven niet de moeite waard is?' },
	{ id: '31', dim: 'depressie', text: 'Dat u geen belangstelling meer kunt opbrengen voor mensen/dingen om u heen?' },
	{ id: '33', dim: 'depressie', text: 'Dat het beter zou zijn als u maar dood was?' },
	{ id: '34', dim: 'depressie', text: 'Dat u nergens meer plezier in kunt hebben?' },

	// Angst (12)
	{ id: '18', dim: 'angst', text: 'Zomaar plotseling schrikken?' },
	{ id: '21', dim: 'angst', text: 'Onbestemde angst-gevoelens?' },
	{ id: '23', dim: 'angst', text: 'Beven in gezelschap van andere mensen?' },
	{ id: '24', dim: 'angst', text: 'Angst- of paniekaanvallen?' },
	{ id: '27', dim: 'angst', text: 'Voelde u zich angstig?' },
	{ id: '40', dim: 'angst', text: 'Angst om alleen het huis uit te gaan?' },
	{ id: '42', dim: 'angst', text: 'Angstig voor iets waarvoor u niet bang hoeft te zijn (dieren, hoogten, kleine ruimten)?' },
	{ id: '43', dim: 'angst', text: 'Bang om te reizen in bussen, treinen of trams?' },
	{ id: '44', dim: 'angst', text: 'Bang om in verlegenheid te raken in gezelschap van andere mensen?' },
	{ id: '45', dim: 'angst', text: 'Gevoel alsof u door een onbekend gevaar wordt bedreigd?' },
	{ id: '49', dim: 'angst', text: 'Moest u bepaalde plaatsen vermijden omdat u er angstig van wordt?' },
	{ id: '50', dim: 'angst', text: 'Moest u bepaalde handelingen een aantal keren herhalen voordat u iets anders kunt doen?' },
]


