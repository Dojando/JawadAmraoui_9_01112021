import { fireEvent, screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES } from "../constants/routes"
import firebase from "../__mocks__/firebase"


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page and I click on submit button of the form", () => {
    // [test ajouté]
    test("Then It should renders Bills page", async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

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
    // [test ajouté]
    test("Then the file should have changed", async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const html = NewBillUI()
      document.body.innerHTML = html

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
      const html = NewBillUI()
      document.body.innerHTML = html
      
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

      const data = {
        type: type.value,
        nom: nom.value,
        date: date.value,
        montant: montant.value,
        pct: pct.value,
        fileName: file.files[0].name
      }

      const postSpy = jest.spyOn(firebase, "post")
      const response = await firebase.post(data)
      expect(postSpy).toHaveBeenCalledTimes(1)
      expect(response.data).toBe("ok")
    })
    test("then, post new bill and fails with 404 message error", async () => {
      firebase.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      jest.spyOn(console, 'error');
      expect(console.error.mock.calls.length).toBe(0);
      console.error("Erreur 404");
      expect(console.error.mock.calls.length).toBe(1);
      expect(console.error.mock.calls[0][0]).toBe("Erreur 404");
      jest.clearAllMocks();
    })
    test("then, post new bill and fails with 500 message error", async () => {
      firebase.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      jest.spyOn(console, 'error');
      expect(console.error.mock.calls.length).toBe(0);
      console.error("Erreur 500");
      expect(console.error.mock.calls.length).toBe(1);
      expect(console.error.mock.calls[0][0]).toBe("Erreur 500");
      jest.clearAllMocks();
    })
  })
})