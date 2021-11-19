import { fireEvent, screen } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES } from "../constants/routes"
import { localStorageMock } from "../__mocks__/localStorage.js"
import firebase from "../__mocks__/firebase"


describe("Given I am connected as an employee", () => {
  // describe("When I am on NewBill Page and I click on submit button with incorrect form", () => {
  //   test("Then It should renders NewBill page", () => {
  //     const html = NewBillUI()
  //     document.body.innerHTML = html
  //     //to-do write assertion
  //   })
  // })

  describe("When I am on NewBill Page and I click on submit button with correct form", () => {
    test("Then It should renders Bills page", async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })

      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const newBill = new NewBill({
        document, onNavigate, firestore: null, localStorage
      }) 

      const bills = await firebase.get()
      const html = NewBillUI()
      document.body.innerHTML = html

      const inputDate = screen.getByTestId("datepicker")
      fireEvent.change(inputDate, { target: { value: bills.data[0].date } })
      expect(inputDate.value).toBe(bills.data[0].date)

      const inputAmount = screen.getByTestId("amount")
      fireEvent.change(inputAmount, { target: { value: bills.data[0].amount } })
      expect(inputAmount.value).toBe(bills.data[0].amount)

      const inputPct = screen.getByTestId("pct")
      fireEvent.change(inputPct, { target: { value: bills.data[0].pct } })
      expect(inputPct.value).toBe(bills.data[0].pct)

      const inputFile = screen.getByTestId("file")
      fireEvent.change(inputFile, { target: { value: bills.data[0].fileUrl } })
      expect(inputFile.value).toBe(bills.data[0].fileUrl)

      
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e)) 
      
      const form = screen.getByTestId("form-new-bill")
      form.addEventListener('submit', handleSubmit)
      fireEvent.submit(form) 
      expect(handleSubmit).toHaveBeenCalled()
    })
  })

  // describe("When I am on NewBill Page and I change the file in the form with an invalid file", () => {
  //   test("Then the file input should be empty", () => {
  //     const html = NewBillUI()
  //     document.body.innerHTML = html
  //     //to-do write assertion
  //   })
  // })

  describe("When I am on NewBill Page and I change the file in the form with a valid file", () => {
    test("Then the file should have changed", async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })

      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const newBill = new NewBill({
        document, onNavigate, firestore: null, localStorage
      }) 

      
      const html = NewBillUI()
      document.body.innerHTML = html
      const bills = await firebase.get()


      const inputFile = screen.getByTestId('file')
      fireEvent.change(inputFile, { target: { files: [new File(["myProof.png"], "myProof.png", { type: "image/png" })] } })
      expect(inputFile.value).toBe("myProof.png")

      const handleChangeFile = jest.fn(newBill.handleChangeFile(e)) 
      inputFile.addEventListener('change', handleChangeFile)
      fireEvent.change(inputFile, { target: { files: [new File(["myProof2.png"], "myProof2.png", { type: "image/png" })] } })
      expect(handleChangeFile).toHaveBeenCalled()

    })
  })
})

// // test d'intégration POST
// describe("Given I am a user connected as Employee", () => {
//   describe("When I am on NewBill Page", () => {
//     test("Then, POST new bill", async () => {})
//     test("Then, fails to POST new bill with message error", async () => {})
//   })
// })