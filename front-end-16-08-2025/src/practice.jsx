   useEffect(() => {
        {
            chosenEditRecordId &&
                getEditRecord();
        }

    }, [chosenEditRecordId])


  const getEditRecord = async () => {
        const payload = { "id": chosenEditRecordId };
        console.log("payload..............edit record id:",chosenEditRecordId)
        try {
            const res = await axios.post(path, payload);
            console.log("Response from API:", res.data);
            const recordForEdit = res.data;
            recordForEdit.map((val) => {
                setName(val.name);
            })
        } catch (err) {
            console.error("Error:", err);
        }
    };