## New Green Layout

Install anaconda [on Linux](https://docs.anaconda.com/anaconda/install/linux/), [on MacOS](https://docs.anaconda.com/anaconda/install/mac-os/), or [on Windows](https://docs.anaconda.com/anaconda/install/windows/).

```
conda env create -f environment.yaml
conda activate new-green-layout
```

### Run demo

Run with `-L` to test on local "mock-up" of Nationbuilder API.

```
python test.py -L
```

In [mockup.py][mock], a FastAPI server directs `/api` endpoints to `/mockup/api/v1` endpoints, or a the API of a live Nationbuilder "nation." The live API remains untested, but it "should work" by running `test.py` with API keys, behind a public webserver such as `https://example.app`:

```
python test.py https://example.app API_CLIENT_ID API_CLIENT_SECRET
```


[mock]: https://github.com/green-rainbow-org/new-green-layout/blob/main/mockup/mockup/mockup.py
