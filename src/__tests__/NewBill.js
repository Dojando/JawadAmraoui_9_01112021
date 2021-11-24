import { fireEvent, screen } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES } from "../constants/routes"
import { localStorageMock } from "../__mocks__/localStorage.js"
import firebase from "../__mocks__/firebase"


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page and I click on submit button with correct form", () => {
    test("Then It should renders Bills page", async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })

      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const html = NewBillUI()
      document.body.innerHTML = html
      
      const newBill = new NewBill({
        document, onNavigate, firestore: null, localStorage
      }) 
            
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
      
      const formButton = screen.getByTestId("form-new-bill")
      formButton.addEventListener('submit', handleSubmit)
      fireEvent.submit(formButton) 

      expect(handleSubmit).toHaveBeenCalled()
      const message = await screen.getByText(/Mes notes de frais/)
      expect(message).toBeTruthy()
    })
  })

  describe("When I am on NewBill Page and I change the file in the form with a valid file", () => {
    test("Then the file should have changed", async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })

      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const html = NewBillUI()
      document.body.innerHTML = html
      const bills = await firebase.get()

      const newBill = new NewBill({
        document, onNavigate, firestore: null, localStorage
      }) 

      const inputFile = screen.getByTestId('file')
      fireEvent.change(inputFile, { target: { files: [new File(["myProof.png"], "myProof.png", { type: "image/png" })] } })
      expect(inputFile.files[0].name).toBe("myProof.png")

      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e)) 
      inputFile.addEventListener('change', handleChangeFile)
      fireEvent.change(inputFile, { target: { files: [new File(["myProof2.png"], "myProof2.png", { type: "image/png" })] } })
      expect(handleChangeFile).toHaveBeenCalled()
    })
  })
})

// test d'intégration POST
describe("Given I am a user connected as Employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then, POST new bill", async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })

      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const html = NewBillUI()
      document.body.innerHTML = html
      
      const newBill = new NewBill({
        document, onNavigate, firestore: null, localStorage
      })

      const bills = await firebase.get()

      const type = screen.getByTestId("expense-type");
      const nom = screen.getByTestId("expense-name");
      nom.value = bills.data[1].name;
      const date = screen.getByTestId("datepicker");
      date.value = bills.data[1].date;
      const montant = screen.getByTestId("amount");
      montant.value = bills.data[1].amount;
      const pct = screen.getByTestId("pct");
      pct.value = bills.data[1].pct;
      const file = screen.getByTestId("file");
      fireEvent.change(file, { target: { files: [new File(["1592770761.jpeg"], "1592770761.jpeg", { type: "image/png" })] } })
    
      const formButton = screen.getByTestId("form-new-bill")
      formButton.addEventListener('submit', function() {
        expect(type.value).toBe(bills.data[1].type)
        expect(nom.value).toBe(bills.data[1].name)
        expect(date.value).toBe(bills.data[1].date)
        expect(montant.value).toBe(`${bills.data[1].amount}`)
        expect(pct.value).toBe(`${bills.data[1].pct}`)
        expect(file.files[0].name).toBe(bills.data[1].fileName)
      })
      fireEvent.submit(formButton) 
    })
  })
})