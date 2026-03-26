import { useState, type ChangeEvent } from 'react'
import '../App.css'
import { PrimaryButton } from '../Components/Button/PrimaryButton'
import { Input } from '../Components/Input/Input'
import { Table, type TableColumn } from '../Components/Table/Table'
import { Modal, type ModalButton } from '../Components/Modal/Modal'

interface Data {
  no: number
  title: string
  content: string
}

export const SamplePage = () => {

  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [data, setData] = useState<Data[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [modalTitle, setModalTitle] = useState<string>("");
  const [modalContent, setModalContent] = useState<string>("");
  const [modalData, setModalData] = useState<Data>();

  const titleChanged = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
  }

  const contentChanged = (e: ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value)
  }

  const buttonClick = () => {
    if (title != "") {
      setData(data => [...data, { no: data.length + 1, title, content }]);
      setTitle("");
      setContent("");
    }
  }

  const tableClick = (row: Data) => {
    setModalTitle(row.title);
    setModalContent(row.content);
    setModalData(row);
    setIsOpen(true);
  }

  const deleteClick = () => {
    const newData = [...data].filter(data => data.no != modalData?.no);
    newData.forEach((data, index) => data.no = index + 1);
    setData(newData);
    setIsOpen(false);
  }

  const saveClick = () => {
    const newData = [...data];
    const target = data.find(data => data.no === modalData?.no)
    if (target != undefined) {
      target.title = modalTitle;
      target.content = modalContent;
      setData(newData);
      setIsOpen(false);
    }
  }

  const modalTitleChanged = (e: ChangeEvent<HTMLInputElement>) => {
    setModalTitle(e.target.value)
  }

  const modalContentChanged = (e: ChangeEvent<HTMLInputElement>) => {
    setModalContent(e.target.value)
  }

  const tableColumns: TableColumn<Data>[] = [
    { key: "no", name: "No." },
    { key: "title", name: "タイトル" },
    { key: "content", name: "内容" },
  ];

  const modalButtons: ModalButton[] = [
    { text: "保存", onClick: saveClick },
    { text: "削除", onClick: deleteClick }
  ]

  return (
    <>
      <h1>Hello World!!!</h1>
      <Input onChange={titleChanged} value={title} placeholder='タイトルを入力してください。'></Input>
      <Input onChange={contentChanged} value={content} placeholder='内容を入力してください。'></Input>
      <PrimaryButton onClick={buttonClick}>追加</PrimaryButton>
      <p>{`入力された文字列は「${title}」「${content}」です。`}</p>

      <hr />

      <Table data={data} columns={tableColumns} onClick={tableClick}></Table>

      <Modal title='詳細情報' isOpen={isOpen} setIsOpen={setIsOpen} buttons={modalButtons}>
        <Input onChange={modalTitleChanged} value={modalTitle} placeholder='タイトルを入力してください。'></Input>
        <Input onChange={modalContentChanged} value={modalContent} placeholder='内容を入力してください。'></Input>
      </Modal>
    </>
  )
}

