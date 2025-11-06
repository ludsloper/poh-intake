import type { SpinnenwebResult } from '../components/Spinnenweb'

const API_ENDPOINT = 'https://www.studentarts.nl/wp-json/custom/v1/sendmail'
const API_SECRET = 'ifoeajofeaf'

interface AdviceRequestData {
	firstName: string
	lastName: string
	dateOfBirth: string // YYYY-MM-DD format from HTML input
	email: string
	numAppointments: number
	preferences: string[]
	notes: string
	language: string
	spinnenwebResult?: SpinnenwebResult | null
	pdfBlob?: Blob | null
}

// Map preference keys to Dutch text
const PREFERENCE_MAPPING: Record<string, string> = {
	poh_ggz: 'Face to face met POH GGZ',
	sport: 'Sport en bewegen',
	group: 'Groepsbijeenkomst',
	online: 'Online apps en coaching',
}

// Convert YYYY-MM-DD to DD/MM/YYYY
function formatDateForAPI(dateStr: string): string {
	const [year, month, day] = dateStr.split('-')
	return `${day}/${month}/${year}`
}

// Convert preferences array to comma-separated string
function formatPreferences(preferences: string[]): string {
	return preferences.map((key) => PREFERENCE_MAPPING[key] || key).join(', ')
}

export async function sendAdviceRequest(
	data: AdviceRequestData
): Promise<{ success: boolean; error?: string }> {
	try {
		const formData = new FormData()

		// Add required fields
		formData.append('secret', API_SECRET)
		formData.append('first_name', data.firstName)
		formData.append('last_name', data.lastName)
		formData.append('date_of_birth', formatDateForAPI(data.dateOfBirth))
		formData.append('email', data.email)
		formData.append('geschat_aantal_afspraken', data.numAppointments.toString())
		formData.append('voorkeursbehandelingen', formatPreferences(data.preferences))
		formData.append('notes', data.notes || '')
		formData.append('language', data.language)

		// Add PDF if spinnenweb was completed
		if (data.spinnenwebResult && data.pdfBlob) {
			formData.append('pdf_file', data.pdfBlob, 'spinnenweb-positive-health.pdf')
		}

		// Send the request
		const response = await fetch(API_ENDPOINT, {
			method: 'POST',
			body: formData,
			// Note: Don't set Content-Type header - browser will set it with boundary for multipart/form-data
		})

		// Check if response status is 200 (success)
		if (response.status === 200) {
			return { success: true }
		} else {
			throw new Error(`HTTP error! status: ${response.status}`)
		}
	} catch (error) {
		console.error('Error sending advice request:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred',
		}
	}
}
